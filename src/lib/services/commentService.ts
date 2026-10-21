"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { AuthError, requireProfile } from "@/lib/server/auth"
import {
  auditEntry,
  auditLog,
  notificationEntry,
  notificationsOf,
  toComment,
} from "@/lib/server/docs"
import { commentRecipients } from "@/lib/notify"
import { commentContent, commentInput, commentSort, docId } from "@/lib/schemas"
import type { IdToken, Comment } from "@/lib/types"
import { canModerate, hasPermission } from "@/lib/utils/userUtils"

const questionRef = (questionId: string) =>
  adminDb.collection("questions").doc(docId.parse(questionId))

export async function addComment(
  idToken: IdToken,
  questionId: string,
  input: unknown
): Promise<string> {
  const actor = await requireProfile(idToken)
  const { content, parentId } = commentInput.parse(input)
  const qRef = questionRef(questionId)
  const ref = qRef.collection("comments").doc()

  await adminDb.runTransaction(async (tx) => {
    const question = await tx.get(qRef)
    if (!question.exists) throw new Error("Question not found.")
    if (question.data()?.locked && !hasPermission(actor, "moderate_forums")) {
      throw new Error("This question is locked.")
    }
    let parentAuthorUid: string | null = null
    if (parentId) {
      const parent = await tx.get(qRef.collection("comments").doc(parentId))
      if (!parent.exists || parent.data()?.deleted) {
        throw new Error("The comment you replied to is gone.")
      }
      parentAuthorUid = parent.data()?.author?.uid ?? null
    }
    tx.set(ref, {
      questionId: qRef.id,
      parentId: parentId ?? null,
      content,
      author: {
        uid: actor.uid,
        displayName: actor.displayName,
        photoURL: actor.photoURL,
      },
      createdAt: FieldValue.serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
    })
    tx.update(qRef, {
      replyCount: FieldValue.increment(1),
      lastActivityAt: FieldValue.serverTimestamp(),
    })
    const recipients = commentRecipients({
      actorUid: actor.uid,
      questionAuthorUid: question.data()?.author?.uid,
      parentAuthorUid,
    })
    for (const { uid, type } of recipients) {
      tx.set(
        notificationsOf(uid).doc(),
        notificationEntry(
          type,
          actor,
          { id: qRef.id, title: question.data()?.title ?? "" },
          ref.id
        )
      )
    }
  })
  return ref.id
}

export async function getThreadedComments(
  questionId: string,
  sortBy: string = "newest"
): Promise<Comment[]> {
  const id = docId.safeParse(questionId)
  if (!id.success) return []
  const sort = commentSort.parse(sortBy)
  try {
    const comments = adminDb.collection(`questions/${id.data}/comments`)
    const query =
      sort === "oldest"
        ? comments.orderBy("createdAt", "asc")
        : sort === "top"
          ? comments.orderBy("upvotes", "desc")
          : comments.orderBy("createdAt", "desc")
    const snap = await query.get()
    const list = snap.docs.map((doc) => toComment(doc.id, id.data, doc.data()))
    // Firestore cannot order by a computed field, so "controversial" (most
    // total votes) is sorted here.
    if (sort === "controversial") {
      list.sort((a, b) => b.upvotes + b.downvotes - (a.upvotes + a.downvotes))
    }
    return list
  } catch (error) {
    console.error("Error fetching comments:", error)
    return []
  }
}

export async function updateComment(
  idToken: IdToken,
  questionId: string,
  commentId: string,
  content: unknown
): Promise<void> {
  const actor = await requireProfile(idToken)
  const ref = questionRef(questionId)
    .collection("comments")
    .doc(docId.parse(commentId))
  const text = commentContent.parse(content)
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists || snap.data()?.deleted) {
      throw new Error("Comment not found.")
    }
    const authorUid = snap.data()?.author?.uid
    if (!canModerate(actor, authorUid)) {
      throw new AuthError("Only the author or a moderator can edit this.")
    }
    tx.update(ref, { content: text, updatedAt: FieldValue.serverTimestamp() })
    if (actor.uid !== authorUid) {
      tx.set(auditLog().doc(), auditEntry(actor, "comment.edit", ref.path))
    }
  })
}

// Removes a comment's text but keeps its place, so replies to it still make
// sense. Clears the accepted answer if this was it.
export async function deleteComment(
  idToken: IdToken,
  questionId: string,
  commentId: string
): Promise<void> {
  const actor = await requireProfile(idToken)
  const qRef = questionRef(questionId)
  const ref = qRef.collection("comments").doc(docId.parse(commentId))
  await adminDb.runTransaction(async (tx) => {
    const [question, snap] = await Promise.all([tx.get(qRef), tx.get(ref)])
    if (!question.exists || !snap.exists) throw new Error("Comment not found.")
    if (snap.data()?.deleted) return
    const authorUid = snap.data()?.author?.uid
    if (!canModerate(actor, authorUid)) {
      throw new AuthError("Only the author or a moderator can delete this.")
    }
    tx.update(ref, {
      deleted: true,
      content: "",
      deletedBy: actor.uid,
      deletedAt: FieldValue.serverTimestamp(),
    })
    tx.update(qRef, {
      replyCount: FieldValue.increment(-1),
      ...(question.data()?.acceptedAnswerId === ref.id
        ? { acceptedAnswerId: null }
        : {}),
    })
    if (actor.uid !== authorUid) {
      tx.set(
        auditLog().doc(),
        auditEntry(actor, "comment.delete", ref.path, {
          content: String(snap.data()?.content ?? "").slice(0, 500),
        })
      )
    }
  })
}
