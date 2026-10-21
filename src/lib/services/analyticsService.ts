"use server"

import { computeAnalytics, type ForumAnalytics } from "@/lib/analytics"
import { COMMUNITIES } from "@/lib/constants"
import { adminDb } from "@/lib/firebase-admin"
import { requirePermission } from "@/lib/server/auth"
import { toComment, toQuestion } from "@/lib/server/docs"
import type { IdToken } from "@/lib/types"

// ponytail: reads every question, comment and member on each load. Cache or
// pre-aggregate daily once the forum passes a few thousand posts.
export async function getForumAnalytics(
  idToken: IdToken
): Promise<ForumAnalytics> {
  await requirePermission(idToken, "manage_users")
  const [questions, comments, users] = await Promise.all([
    adminDb.collection("questions").get(),
    adminDb.collectionGroup("comments").get(),
    adminDb.collection("users").select().get(),
  ])
  return computeAnalytics(
    questions.docs.map((d) => toQuestion(d.id, d.data())),
    comments.docs.map((d) =>
      toComment(d.id, d.ref.parent.parent?.id ?? "", d.data())
    ),
    users.docs.map((d) => ({ uid: d.id })),
    COMMUNITIES.filter((c) => c.id !== "all").map(({ id, name }) => ({
      id,
      name,
    })),
    new Date()
  )
}
