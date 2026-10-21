"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { AuthError, requireProfile } from "@/lib/server/auth"
import { auditEntry, auditLog, toComment } from "@/lib/server/docs"
import { commentContent, commentInput, commentSort, docId } from "@/lib/schemas"
import type { IdToken, Comment } from "@/lib/types"
import { canModerate } from "@/lib/utils/userUtils"

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
    if (parentId) {
      const parent = await tx.get(qRef.collection("comments").doc(parentId))
      if (!parent.exists) throw new Error("The comment you replied to is gone.")
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
    if (!snap.exists) throw new Error("Comment not found.")
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
