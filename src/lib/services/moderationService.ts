"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { requirePermission, requireProfile } from "@/lib/server/auth"
import { auditEntry, auditLog, toAuditEntry, toReport } from "@/lib/server/docs"
import { docId, reportInput, reportResolution } from "@/lib/schemas"
import { deleteComment } from "@/lib/services/commentService"
import { deleteQuestion } from "@/lib/services/questionService"
import type { AuditEntry, IdToken, Report } from "@/lib/types"

const reports = () => adminDb.collection("reports")

// Any signed-in student can flag a question or comment for moderators. One
// report per person per item; reporting again updates the reason.
export async function reportContent(
  idToken: IdToken,
  input: unknown
): Promise<void> {
  const actor = await requireProfile(idToken)
  const { questionId, commentId, reason, details } = reportInput.parse(input)
  const question = await adminDb.collection("questions").doc(questionId).get()
  if (!question.exists) throw new Error("Not found.")
  const target = commentId
    ? await question.ref.collection("comments").doc(commentId).get()
    : question
  if (!target.exists || target.data()?.deleted) throw new Error("Not found.")

  await reports()
    .doc(`${questionId}_${commentId ?? "question"}_${actor.uid}`)
    .set({
      questionId,
      commentId: commentId ?? null,
      questionTitle: question.data()?.title ?? "",
      excerpt: String(target.data()?.content ?? "").slice(0, 1000),
      targetAuthor: target.data()?.author ?? null,
      reason,
      details,
      reporter: {
        uid: actor.uid,
        displayName: actor.displayName,
        photoURL: actor.photoURL,
      },
      status: "open",
      createdAt: FieldValue.serverTimestamp(),
    })
}

export async function getOpenReports(idToken: IdToken): Promise<Report[]> {
  await requirePermission(idToken, "moderate_forums")
  // ponytail: equality filter only (no composite index), sorted here; page
  // it when the queue regularly holds hundreds.
  const snap = await reports().where("status", "==", "open").limit(500).get()
  return snap.docs
    .map((doc) => toReport(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// Dismiss every open report on an item, or remove the item and close them.
export async function resolveReports(
  idToken: IdToken,
  questionId: string,
  commentId: string | null,
  resolution: string
): Promise<void> {
  const actor = await requirePermission(idToken, "moderate_forums")
  const qid = docId.parse(questionId)
  const cid = commentId === null ? null : docId.parse(commentId)
  const action = reportResolution.parse(resolution)

  if (action === "remove") {
    if (cid) await deleteComment(idToken, qid, cid)
    else await deleteQuestion(idToken, qid)
  }

  const open = (
    await reports().where("questionId", "==", qid).get()
  ).docs.filter(
    (doc) =>
      doc.data().status === "open" && (doc.data().commentId ?? null) === cid
  )
  const batch = adminDb.batch()
  for (const doc of open) {
    batch.update(doc.ref, {
      status: action === "remove" ? "removed" : "dismissed",
      resolvedBy: actor.uid,
      resolvedAt: FieldValue.serverTimestamp(),
    })
  }
  batch.set(
    auditLog().doc(),
    auditEntry(
      actor,
      `report.${action}`,
      `questions/${qid}${cid ? `/comments/${cid}` : ""}`,
      {
        reports: open.length,
      }
    )
  )
  await batch.commit()
}

export async function getAuditLog(idToken: IdToken): Promise<AuditEntry[]> {
  await requirePermission(idToken, "manage_users")
  const snap = await auditLog().orderBy("createdAt", "desc").limit(100).get()
  return snap.docs.map((doc) => toAuditEntry(doc.id, doc.data()))
}
