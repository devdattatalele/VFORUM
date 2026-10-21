import "server-only"
import type { DecodedIdToken } from "firebase-admin/auth"
import { FieldValue } from "firebase-admin/firestore"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { isAllowedEmail, isBootstrapAdmin, nameFromEmail } from "@/lib/identity"
import { serialize } from "@/lib/serialize"
import type { UserProfile } from "@/lib/types"
import { getPermissionsForRole, hasPermission } from "@/lib/utils/userUtils"

// Server actions are public HTTP endpoints. The browser sends a Firebase ID
// token as the first argument; everything about the caller (uid, email, role,
// permissions) is derived from that token and Firestore, never from the client.

export class AuthError extends Error {
  constructor(message = "Sign in required.") {
    super(message)
    this.name = "AuthError"
  }
}

type Role = NonNullable<UserProfile["role"]>
const ROLES: Role[] = ["user", "moderator", "admin"]

export async function requireUser(idToken: unknown): Promise<DecodedIdToken> {
  if (typeof idToken !== "string" || !idToken || idToken.length > 8192) {
    throw new AuthError()
  }
  let decoded: DecodedIdToken
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    throw new AuthError()
  }
  if (!isAllowedEmail(decoded.email)) {
    throw new AuthError("Sign-in is restricted to @vit.edu.in addresses.")
  }
  return decoded
}

// The caller's profile, created on first use.
export async function requireProfile(idToken: unknown): Promise<UserProfile> {
  const decoded = await requireUser(idToken)
  const email = decoded.email as string
  const tokenName =
    typeof decoded.name === "string" && decoded.name.trim()
      ? decoded.name.trim()
      : null

  const ref = adminDb.collection("users").doc(decoded.uid)
  const snap = await ref.get()
  let stored = snap.exists ? serialize(snap.data() ?? {}) : null

  if (!stored) {
    const now = new Date().toISOString()
    await ref.set({
      uid: decoded.uid,
      email,
      displayName: tokenName ?? nameFromEmail(email),
      photoURL: decoded.picture ?? null,
      role: "user",
      permissions: getPermissionsForRole("user"),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    stored = {
      displayName: tokenName ?? nameFromEmail(email),
      photoURL: decoded.picture ?? null,
      role: "user",
      createdAt: now,
      updatedAt: now,
    }
  } else if (!stored.displayName) {
    const displayName = tokenName ?? nameFromEmail(email)
    await ref.update({ displayName, updatedAt: FieldValue.serverTimestamp() })
    stored = { ...stored, displayName }
  }

  const storedRole: Role = ROLES.includes(stored.role) ? stored.role : "user"
  const role: Role = isBootstrapAdmin(email, decoded.email_verified)
    ? "admin"
    : storedRole

  return {
    uid: decoded.uid,
    email,
    displayName: stored.displayName ?? null,
    photoURL: stored.photoURL ?? null,
    role,
    permissions: getPermissionsForRole(role),
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  }
}

export async function requirePermission(
  idToken: unknown,
  permission: string
): Promise<UserProfile> {
  const profile = await requireProfile(idToken)
  if (!hasPermission(profile, permission)) {
    throw new AuthError("You do not have permission to do that.")
  }
  return profile
}
