"use server"

import { z } from "zod"
import { adminDb } from "@/lib/firebase-admin"
import { requireUser } from "@/lib/server/auth"
import { notificationsOf, toNotification } from "@/lib/server/docs"
import { docId } from "@/lib/schemas"
import type { AppNotification, IdToken } from "@/lib/types"

// The caller's own notifications only: the uid comes from the token.
export async function getMyNotifications(
  idToken: IdToken
): Promise<{ items: AppNotification[]; unread: number }> {
  const { uid } = await requireUser(idToken)
  const col = notificationsOf(uid)
  const [latest, unread] = await Promise.all([
    col.orderBy("createdAt", "desc").limit(20).get(),
    col.where("read", "==", false).count().get(),
  ])
  return {
    items: latest.docs.map((doc) => toNotification(doc.id, doc.data())),
    unread: unread.data().count,
  }
}

// Marks the given notifications read, or all unread ones when ids is omitted.
export async function markNotificationsRead(
  idToken: IdToken,
  ids?: string[]
): Promise<void> {
  const { uid } = await requireUser(idToken)
  const col = notificationsOf(uid)
  const refs =
    ids === undefined
      ? (await col.where("read", "==", false).limit(500).get()).docs.map(
          (doc) => doc.ref
        )
      : z
          .array(docId)
          .max(100)
          .parse(ids)
          .map((id) => col.doc(id))
  if (refs.length === 0) return
  const existing = (await adminDb.getAll(...refs)).filter((doc) => doc.exists)
  const batch = adminDb.batch()
  for (const doc of existing) batch.update(doc.ref, { read: true })
  await batch.commit()
}
