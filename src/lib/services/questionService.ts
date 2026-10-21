"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { AuthError, requireProfile } from "@/lib/server/auth"
import { auditEntry, auditLog, toQuestion } from "@/lib/server/docs"
import { docId, questionInput, questionUpdate } from "@/lib/schemas"
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
