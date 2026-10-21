"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { requirePermission, requireProfile } from "@/lib/server/auth"
import { auditEntry, auditLog, toProfile } from "@/lib/server/docs"
import { docId, role as roleSchema } from "@/lib/schemas"
import type { IdToken, UserProfile } from "@/lib/types"
import { getPermissionsForRole } from "@/lib/utils/userUtils"

const users = () => adminDb.collection("users")

// The signed-in user's own profile, created on first sign-in.
export async function getMyProfile(idToken: IdToken): Promise<UserProfile> {
  return requireProfile(idToken)
}

// Admin lookup by uid or email.
export async function searchUser(
  idToken: IdToken,
  term: string
): Promise<UserProfile | null> {
  await requirePermission(idToken, "manage_users")
  const query = typeof term === "string" ? term.trim() : ""
  if (!query || query.length > 254) return null

  if (docId.safeParse(query).success) {
    const byUid = await users().doc(query).get()
    if (byUid.exists) return toProfile(byUid.data())
  }
  if (query.includes("@")) {
    const byEmail = await users()
      .where("email", "in", Array.from(new Set([query, query.toLowerCase()])))
      .limit(1)
      .get()
    if (!byEmail.empty) return toProfile(byEmail.docs[0].data())
  }
  return null
}

export async function updateUserRole(
  idToken: IdToken,
  uid: string,
  role: string
): Promise<void> {
  const actor = await requirePermission(idToken, "manage_users")
  const ref = users().doc(docId.parse(uid))
  const next = roleSchema.parse(role)
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error("User not found.")
    const previous = snap.data()?.role ?? "user"
    tx.update(ref, {
      role: next,
      permissions: getPermissionsForRole(next),
      updatedAt: FieldValue.serverTimestamp(),
    })
    tx.set(
      auditLog().doc(),
      auditEntry(actor, "user.role", ref.path, { from: previous, to: next })
    )
  })
}

export async function getAllUsers(idToken: IdToken): Promise<UserProfile[]> {
  await requirePermission(idToken, "manage_users")
  const snap = await users().get()
  return snap.docs.map((doc) => toProfile(doc.data()))
}
