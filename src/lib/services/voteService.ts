"use server"

import type { IdToken } from "@/lib/types"
import { FieldValue, type DocumentReference } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { requireUser } from "@/lib/server/auth"
import { docId, voteType } from "@/lib/schemas"
import { voteDelta, type VoteType } from "@/lib/votes"

// One vote per user per item, stored at votes/{questions|comments}/{itemId}/{uid}.
// The vote and the item's counters change in one transaction, so double clicks
// and concurrent votes cannot skew the counts.
async function castVote(
  item: DocumentReference,
  vote: DocumentReference,
  next: VoteType
) {
  await adminDb.runTransaction(async (tx) => {
    const [itemSnap, voteSnap] = await Promise.all([tx.get(item), tx.get(vote)])
    if (!itemSnap.exists) throw new Error("Not found.")
    const current: VoteType = voteSnap.data()?.voteType ?? "none"
    if (current === next) return
    tx.set(vote, { voteType: next, updatedAt: FieldValue.serverTimestamp() })
    const { up, down } = voteDelta(current, next)
    const counters: Record<string, FieldValue> = {}
    if (up) counters.upvotes = FieldValue.increment(up)
    if (down) counters.downvotes = FieldValue.increment(down)
    if (Object.keys(counters).length > 0) tx.update(item, counters)
  })
}

export async function voteOnQuestion(
  idToken: IdToken,
  questionId: string,
  next: VoteType
): Promise<void> {
  const { uid } = await requireUser(idToken)
  const id = docId.parse(questionId)
  await castVote(
    adminDb.collection("questions").doc(id),
    adminDb.doc(`votes/questions/${id}/${uid}`),
    voteType.parse(next)
  )
}

export async function voteOnComment(
  idToken: IdToken,
  questionId: string,
  commentId: string,
  next: VoteType
): Promise<void> {
  const { uid } = await requireUser(idToken)
  const qid = docId.parse(questionId)
  const cid = docId.parse(commentId)
  await castVote(
    adminDb.doc(`questions/${qid}/comments/${cid}`),
    adminDb.doc(`votes/comments/${cid}/${uid}`),
    voteType.parse(next)
  )
}

export async function getUserVote(
  idToken: IdToken,
  itemId: string,
  itemType: "question" | "comment"
): Promise<VoteType> {
  const { uid } = await requireUser(idToken)
  const id = docId.parse(itemId)
  const kind = itemType === "comment" ? "comments" : "questions"
  const snap = await adminDb.doc(`votes/${kind}/${id}/${uid}`).get()
  return snap.data()?.voteType ?? "none"
}
