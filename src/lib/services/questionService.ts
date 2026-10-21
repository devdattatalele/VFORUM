"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { AuthError, requirePermission, requireProfile } from "@/lib/server/auth"
import {
  auditEntry,
  auditLog,
  notificationEntry,
  notificationsOf,
  toQuestion,
} from "@/lib/server/docs"
import {
  docId,
  questionFlags,
  questionInput,
  questionUpdate,
} from "@/lib/schemas"
import type { IdToken, Question } from "@/lib/types"
import { canModerate } from "@/lib/utils/userUtils"

const questions = () => adminDb.collection("questions")

export async function addQuestion(
  idToken: IdToken,
  input: unknown
): Promise<string> {
  const actor = await requireProfile(idToken)
  const data = questionInput.parse(input)
  const ref = await questions().add({
    ...data,
    author: {
      uid: actor.uid,
      displayName: actor.displayName,
      photoURL: actor.photoURL,
    },
    createdAt: FieldValue.serverTimestamp(),
    lastActivityAt: FieldValue.serverTimestamp(),
    upvotes: 0,
    downvotes: 0,
    views: 0,
    replyCount: 0,
  })
  return ref.id
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const snap = await questions().get()
    return snap.docs.map((doc) => toQuestion(doc.id, doc.data()))
  } catch (error) {
    console.error("Error fetching questions:", error)
    return []
  }
}

export async function getQuestionById(
  questionId: string
): Promise<Question | null> {
  const id = docId.safeParse(questionId)
  if (!id.success) return null
  try {
    const ref = questions().doc(id.data)
    const snap = await ref.get()
    if (!snap.exists) return null
    await ref.update({ views: FieldValue.increment(1) })
    return toQuestion(snap.id, snap.data())
  } catch (error) {
    console.error("Error fetching question by ID:", error)
    return null
  }
}

export async function getQuestionsByCommunity(
  communityId: string
): Promise<Question[]> {
  if (typeof communityId !== "string" || communityId.length > 64) return []
  try {
    const snap = await questions().where("communityId", "==", communityId).get()
    return snap.docs.map((doc) => toQuestion(doc.id, doc.data()))
  } catch (error) {
    console.error("Error fetching questions by community:", error)
    return []
  }
}

export async function updateQuestion(
  idToken: IdToken,
  questionId: string,
  updates: unknown
): Promise<void> {
  const actor = await requireProfile(idToken)
  const ref = questions().doc(docId.parse(questionId))
  const data = questionUpdate.parse(updates)
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error("Question not found.")
    const authorUid = snap.data()?.author?.uid
    if (!canModerate(actor, authorUid)) {
      throw new AuthError("Only the author or a moderator can edit this.")
    }
    tx.update(ref, { ...data, updatedAt: FieldValue.serverTimestamp() })
    if (actor.uid !== authorUid) {
      tx.set(auditLog().doc(), auditEntry(actor, "question.edit", ref.path))
    }
  })
}

// The question's author (or a moderator) marks one top-level answer as the
// accepted one, or clears it with null.
export async function acceptAnswer(
  idToken: IdToken,
  questionId: string,
  commentId: string | null
): Promise<void> {
  const actor = await requireProfile(idToken)
  const ref = questions().doc(docId.parse(questionId))
  const answerId = commentId === null ? null : docId.parse(commentId)
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error("Question not found.")
    const authorUid = snap.data()?.author?.uid
    if (!canModerate(actor, authorUid)) {
      throw new AuthError(
        "Only the author or a moderator can accept an answer."
      )
    }
    let answerAuthorUid: string | null = null
    if (answerId) {
      const answer = await tx.get(ref.collection("comments").doc(answerId))
      if (!answer.exists || answer.data()?.parentId || answer.data()?.deleted) {
        throw new Error("Only a top-level answer can be accepted.")
      }
      answerAuthorUid = answer.data()?.author?.uid ?? null
    }
    tx.update(ref, { acceptedAnswerId: answerId })
    if (
      answerId &&
      answerAuthorUid &&
      answerAuthorUid !== actor.uid &&
      snap.data()?.acceptedAnswerId !== answerId
    ) {
      tx.set(
        notificationsOf(answerAuthorUid).doc(),
        notificationEntry(
          "accepted",
          actor,
          { id: ref.id, title: snap.data()?.title ?? "" },
          answerId
        )
      )
    }
    if (actor.uid !== authorUid) {
      tx.set(
        auditLog().doc(),
        auditEntry(actor, "question.accept", ref.path, { answerId })
      )
    }
  })
}

// Moderators pin a question to the top of the forum or lock it to new answers.
export async function setQuestionFlags(
  idToken: IdToken,
  questionId: string,
  flags: unknown
): Promise<void> {
  const actor = await requirePermission(idToken, "moderate_forums")
  const ref = questions().doc(docId.parse(questionId))
  const changes = questionFlags.parse(flags)
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error("Question not found.")
    tx.update(ref, changes)
    tx.set(
      auditLog().doc(),
      auditEntry(actor, "question.flags", ref.path, changes)
    )
  })
}

export async function deleteQuestion(
  idToken: IdToken,
  questionId: string
): Promise<void> {
  const actor = await requireProfile(idToken)
  const ref = questions().doc(docId.parse(questionId))
  const snap = await ref.get()
  if (!snap.exists) return
  const authorUid = snap.data()?.author?.uid
  if (!canModerate(actor, authorUid)) {
    throw new AuthError("Only the author or a moderator can delete this.")
  }
  if (actor.uid !== authorUid) {
    await auditLog().add(
      auditEntry(actor, "question.delete", ref.path, {
        title: snap.data()?.title ?? null,
      })
    )
  }
  // Removes the comments subcollection too; a plain delete would orphan it.
  await adminDb.recursiveDelete(ref)
}
