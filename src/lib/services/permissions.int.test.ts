import { beforeAll, describe, expect, it } from "vitest"
import { adminDb } from "@/lib/firebase-admin"
import { createAccount, persona, tokenFor } from "@/test/emulator"
import type { IdToken } from "@/lib/types"
import {
  addQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
} from "@/lib/services/questionService"
import {
  addComment,
  getThreadedComments,
  updateComment,
} from "@/lib/services/commentService"
import { getUserVote, voteOnQuestion } from "@/lib/services/voteService"
import { addEvent } from "@/lib/services/eventService"
import {
  getAllUsers,
  getMyProfile,
  searchUser,
  updateUserRole,
} from "@/lib/services/userService"

const question = {
  title: "Integration test question title",
  content: "Body long enough to pass validation rules.",
  tags: ["Testing", "integration"],
  communityId: "general-tech",
}

let student: IdToken
let student2: IdToken
let moderator: IdToken
let admin: IdToken

beforeAll(async () => {
  ;[student, student2, moderator, admin] = await Promise.all([
    tokenFor(persona("dev-student").email),
    tokenFor(persona("dev-student-2").email),
    tokenFor(persona("dev-moderator").email),
    tokenFor(persona("dev-admin").email),
  ])
})

const auditCount = async (action: string) =>
  (await adminDb.collection("audit_log").where("action", "==", action).get())
    .size

describe("identity", () => {
  it("rejects calls without a valid token", async () => {
    await expect(addQuestion("" as IdToken, question)).rejects.toThrow(
      /Sign in/
    )
    await expect(
      addQuestion("forged.token.value" as IdToken, question)
    ).rejects.toThrow(/Sign in/)
  })

  it("rejects accounts outside the college domain", async () => {
    const outsider = await createAccount("someone@gmail.com")
    await expect(addQuestion(outsider, question)).rejects.toThrow(
      /vit\.edu\.in/
    )
  })

  it("derives the author from the token, ignoring anything the client sends", async () => {
    const id = await addQuestion(student, {
      ...question,
      author: { uid: "dev-admin", displayName: "Spoofed" },
      upvotes: 999,
    })
    const saved = await getQuestionById(id)
    expect(saved?.author.uid).toBe("dev-student")
    expect(saved?.upvotes).toBe(0)
    expect(saved?.tags).toEqual(["testing", "integration"])
  })

  it("creates a profile with a derived name on first sign-in", async () => {
    const fresh = await createAccount("new.joinee@vit.edu.in")
    const profile = await getMyProfile(fresh)
    expect(profile.role).toBe("user")
    expect(profile.displayName).toBe("New Joinee")
  })

  it("never sends stored author emails or roles to visitors", async () => {
    const ref = await adminDb.collection("questions").add({
      ...question,
      author: {
        uid: "legacy",
        displayName: "Legacy",
        photoURL: null,
        email: "legacy@vit.edu.in",
        role: "admin",
        permissions: ["manage_users"],
      },
      createdAt: new Date(),
    })
    const listed = (await getQuestions()).find((q) => q.id === ref.id)
    expect(Object.keys(listed!.author).sort()).toEqual([
      "displayName",
      "photoURL",
      "uid",
    ])
  })
})

describe("ownership", () => {
  it("lets only the author or a moderator edit and delete, and audits moderators", async () => {
    const id = await addQuestion(student, question)
    const edit = { ...question, title: "Edited integration test title" }

    await expect(updateQuestion(student2, id, edit)).rejects.toThrow(
      /author or a moderator/
    )
    await expect(deleteQuestion(student2, id)).rejects.toThrow(
      /author or a moderator/
    )

    await updateQuestion(student, id, edit)
    expect(await auditCount("question.edit")).toBe(0)

    await updateQuestion(moderator, id, {
      ...edit,
      title: "Moderator fixed the title",
    })
    expect((await getQuestionById(id))?.title).toBe("Moderator fixed the title")
    expect(await auditCount("question.edit")).toBe(1)

    await addComment(student2, id, {
      content: "An answer that will be removed",
    })
    await deleteQuestion(moderator, id)
    expect(await getQuestionById(id)).toBeNull()
    expect(
      (await adminDb.collection(`questions/${id}/comments`).get()).empty
    ).toBe(true)
    expect(await auditCount("question.delete")).toBe(1)
  })

  it("applies the same rule to comments", async () => {
    const id = await addQuestion(student, question)
    const commentId = await addComment(student2, id, {
      content: "First answer",
    })
    await expect(
      updateComment(student, id, commentId, "Hijacked")
    ).rejects.toThrow(/author or a moderator/)
    await updateComment(student2, id, commentId, "First answer, edited")
    const [comment] = await getThreadedComments(id)
    expect(comment.content).toBe("First answer, edited")
  })
})

describe("comments", () => {
  it("counts replies and rejects replies to missing comments", async () => {
    const id = await addQuestion(student, question)
    const parent = await addComment(student2, id, {
      content: "Top-level answer",
    })
    await addComment(student, id, { content: "A reply", parentId: parent })
    expect((await getQuestionById(id))?.replyCount).toBe(2)
    await expect(
      addComment(student, id, { content: "Orphan", parentId: "missing" })
    ).rejects.toThrow()
    await expect(
      addComment(student, "a/b", { content: "Path" })
    ).rejects.toThrow()
  })
})

describe("votes", () => {
  it("counts one vote per user and moves it on change", async () => {
    const id = await addQuestion(student, question)
    const counts = async () => {
      const q = await getQuestionById(id)
      return [q?.upvotes, q?.downvotes]
    }
    await voteOnQuestion(student2, id, "up")
    await voteOnQuestion(student2, id, "up")
    expect(await counts()).toEqual([1, 0])
    await voteOnQuestion(student2, id, "down")
    expect(await counts()).toEqual([0, 1])
    expect(await getUserVote(student2, id, "question")).toBe("down")
    await voteOnQuestion(student2, id, "none")
    expect(await counts()).toEqual([0, 0])
    await Promise.all([
      voteOnQuestion(moderator, id, "up"),
      voteOnQuestion(moderator, id, "up"),
    ])
    expect(await counts()).toEqual([1, 0])
  })
})

describe("roles", () => {
  it("keeps user management to admins and audits role changes", async () => {
    await expect(
      updateUserRole(student, "dev-student", "admin")
    ).rejects.toThrow(/permission/)
    await expect(
      searchUser(student, persona("dev-admin").email)
    ).rejects.toThrow(/permission/)
    await expect(getAllUsers(moderator)).rejects.toThrow(/permission/)

    const found = await searchUser(admin, persona("dev-student-2").email)
    expect(found?.uid).toBe("dev-student-2")

    await updateUserRole(admin, "dev-student-2", "moderator")
    expect(
      (await getMyProfile(await tokenFor(persona("dev-student-2").email))).role
    ).toBe("moderator")
    expect(await auditCount("user.role")).toBe(1)
    await updateUserRole(admin, "dev-student-2", "user")
  })

  it("bootstraps admins from ADMIN_EMAILS for verified mailboxes only", async () => {
    const previous = process.env.ADMIN_EMAILS
    process.env.ADMIN_EMAILS = `${persona("dev-student").email}, unverified@vit.edu.in`
    try {
      expect((await getMyProfile(student)).role).toBe("admin")
      const unverified = await createAccount("unverified@vit.edu.in", false)
      expect((await getMyProfile(unverified)).role).toBe("user")
    } finally {
      process.env.ADMIN_EMAILS = previous
    }
  })
})

describe("events", () => {
  const event = {
    title: "Integration Event",
    description: "An event created by the integration test suite.",
    posterImageUrl: "https://placehold.co/600x400.png",
    clubName: "Test Club",
    communityId: "gdg",
    rsvpLink: "",
    dateTime: new Date("2030-01-01T10:00:00.000Z"),
  }

  it("lets moderators create events and rejects script links", async () => {
    await expect(addEvent(student, event)).rejects.toThrow(/permission/)
    await expect(
      addEvent(moderator, { ...event, rsvpLink: "javascript:alert(1)" })
    ).rejects.toThrow()
    expect(await addEvent(moderator, event)).toMatch(/^[A-Za-z0-9]+$/)
  })
})

describe("accepted answers", () => {
  it("lets the asker accept one top-level answer", async () => {
    const { acceptAnswer } = await import("@/lib/services/questionService")
    const id = await addQuestion(student, question)
    const answer = await addComment(student2, id, { content: "The answer" })
    const reply = await addComment(student, id, {
      content: "A reply, not an answer",
      parentId: answer,
    })

    await expect(acceptAnswer(student2, id, answer)).rejects.toThrow(
      /author or a moderator/
    )
    await expect(acceptAnswer(student, id, reply)).rejects.toThrow(/top-level/)
    await expect(acceptAnswer(student, id, "missing")).rejects.toThrow(
      /top-level/
    )

    await acceptAnswer(student, id, answer)
    expect((await getQuestionById(id))?.acceptedAnswerId).toBe(answer)
    await acceptAnswer(student, id, null)
    expect((await getQuestionById(id))?.acceptedAnswerId).toBeNull()
  })
})

describe("notifications", () => {
  it("tells the right people, once, and never the actor", async () => {
    const { acceptAnswer } = await import("@/lib/services/questionService")
    const { getMyNotifications, markNotificationsRead } =
      await import("@/lib/services/notificationService")
    const about = async (token: IdToken, questionId: string) =>
      (await getMyNotifications(token)).items
        .filter((n) => n.questionId === questionId)
        .map((n) => n.type)
        .sort()

    const id = await addQuestion(student, question)
    const answer = await addComment(student2, id, { content: "Answer" })
    await addComment(student, id, { content: "Thanks!", parentId: answer })
    await addComment(moderator, id, { content: "Also see", parentId: answer })
    await acceptAnswer(student, id, answer)
    await acceptAnswer(student, id, answer)

    expect(await about(student, id)).toEqual(["answer", "comment"])
    expect(await about(student2, id)).toEqual(["accepted", "reply", "reply"])
    expect(await about(moderator, id)).toEqual([])

    const before = (await getMyNotifications(student2)).unread
    const first = (await getMyNotifications(student2)).items.find(
      (n) => n.questionId === id
    )!
    await markNotificationsRead(student2, [first.id, "not-a-real-id"])
    expect((await getMyNotifications(student2)).unread).toBe(before - 1)
    await markNotificationsRead(student2)
    expect((await getMyNotifications(student2)).unread).toBe(0)
  })
})

describe("moderation", () => {
  it("keeps pin and lock to moderators, and lock stops new answers", async () => {
    const { setQuestionFlags } = await import("@/lib/services/questionService")
    const id = await addQuestion(student, question)

    await expect(
      setQuestionFlags(student, id, { pinned: true })
    ).rejects.toThrow(/permission/)
    await setQuestionFlags(moderator, id, { pinned: true, locked: true })
    const flagged = await getQuestionById(id)
    expect([flagged?.pinned, flagged?.locked]).toEqual([true, true])

    await expect(
      addComment(student2, id, { content: "Late answer" })
    ).rejects.toThrow(/locked/)
    await addComment(moderator, id, { content: "Closing note from moderators" })
    await setQuestionFlags(moderator, id, { locked: false })
    await addComment(student2, id, { content: "Answer after unlock" })
  })

  it("deletes comments in place, for the author or a moderator", async () => {
    const { acceptAnswer } = await import("@/lib/services/questionService")
    const { deleteComment } = await import("@/lib/services/commentService")
    const id = await addQuestion(student, question)
    const answer = await addComment(student2, id, { content: "Doomed answer" })
    const reply = await addComment(student, id, {
      content: "Reply",
      parentId: answer,
    })
    await acceptAnswer(student, id, answer)
    await voteOnQuestion(student, id, "up")

    await expect(deleteComment(student, id, answer)).rejects.toThrow(
      /author or a moderator/
    )
    await deleteComment(student2, id, answer)
    await deleteComment(student2, id, answer)

    const after = await getQuestionById(id)
    expect(after?.replyCount).toBe(1)
    expect(after?.acceptedAnswerId).toBeNull()
    const comments = await getThreadedComments(id)
    const deleted = comments.find((c) => c.id === answer)!
    expect([deleted.deleted, deleted.content]).toEqual([true, ""])
    expect(comments.find((c) => c.id === reply)?.parentId).toBe(answer)

    const { voteOnComment } = await import("@/lib/services/voteService")
    await expect(voteOnComment(student, id, answer, "up")).rejects.toThrow()
    await expect(
      updateComment(student2, id, answer, "Back from the dead")
    ).rejects.toThrow()
    await expect(
      addComment(student, id, { content: "Hello?", parentId: answer })
    ).rejects.toThrow()
    await expect(acceptAnswer(student, id, answer)).rejects.toThrow()

    await deleteComment(moderator, id, reply)
    expect(await auditCount("comment.delete")).toBe(1)
  })

  it("collects reports for moderators and resolves them", async () => {
    const { getOpenReports, reportContent, resolveReports, getAuditLog } =
      await import("@/lib/services/moderationService")
    const id = await addQuestion(student, question)
    const spam = await addComment(student2, id, {
      content: "Buy followers now",
    })

    await reportContent(student, {
      questionId: id,
      commentId: spam,
      reason: "spam",
    })
    await reportContent(student, {
      questionId: id,
      commentId: spam,
      reason: "spam",
      details: "Again",
    })
    await reportContent(moderator, {
      questionId: id,
      commentId: spam,
      reason: "spam",
    })
    await reportContent(student2, { questionId: id, reason: "off-topic" })

    await expect(getOpenReports(student)).rejects.toThrow(/permission/)
    const open = (await getOpenReports(moderator)).filter(
      (r) => r.questionId === id
    )
    expect(open.filter((r) => r.commentId === spam)).toHaveLength(2)
    expect(open.find((r) => r.commentId === spam)?.excerpt).toBe(
      "Buy followers now"
    )

    await resolveReports(moderator, id, null, "dismiss")
    await resolveReports(moderator, id, spam, "remove")
    expect(
      (await getOpenReports(moderator)).filter((r) => r.questionId === id)
    ).toEqual([])
    expect(
      (await getThreadedComments(id)).find((c) => c.id === spam)?.deleted
    ).toBe(true)

    await expect(getAuditLog(moderator)).rejects.toThrow(/permission/)
    const actions = (await getAuditLog(admin)).map((e) => e.action)
    expect(actions).toEqual(
      expect.arrayContaining(["report.dismiss", "report.remove"])
    )
  })
})
