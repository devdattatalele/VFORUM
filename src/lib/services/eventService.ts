"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { requirePermission } from "@/lib/server/auth"
import { toEvent } from "@/lib/server/docs"
import { docId, eventInput } from "@/lib/schemas"
import type { IdToken, Event } from "@/lib/types"

const events = () => adminDb.collection("events")

export async function addEvent(
  idToken: IdToken,
  input: unknown
): Promise<string> {
  const actor = await requirePermission(idToken, "create_events")
  const { dateTime, rsvpLink, ...data } = eventInput.parse(input)
  const ref = await events().add({
    ...data,
    rsvpLink: rsvpLink || null,
    author: {
      uid: actor.uid,
      displayName: actor.displayName,
      photoURL: actor.photoURL,
    },
    dateTime: dateTime.toISOString(),
    createdAt: FieldValue.serverTimestamp(),
    rsvpCount: 0,
  })
  return ref.id
}

export async function getEvents(): Promise<Event[]> {
  try {
    const snap = await events().get()
    return snap.docs.map((doc) => toEvent(doc.id, doc.data()))
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const id = docId.safeParse(eventId)
  if (!id.success) return null
  try {
    const snap = await events().doc(id.data).get()
    return snap.exists ? toEvent(snap.id, snap.data()) : null
  } catch (error) {
    console.error("Error fetching event by ID:", error)
    return null
  }
}

export async function getEventsByCommunity(
  communityId: string
): Promise<Event[]> {
  if (typeof communityId !== "string" || communityId.length > 64) return []
  try {
    const snap = await events().where("communityId", "==", communityId).get()
    return snap.docs.map((doc) => toEvent(doc.id, doc.data()))
  } catch (error) {
    console.error("Error fetching events by community:", error)
    return []
  }
}
