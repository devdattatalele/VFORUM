// Server-only session helpers built on the Firebase Admin SDK.
//
// These read the httpOnly session cookie minted by POST /api/auth/session
// (see src/app/api/auth/session/route.ts) and resolve the caller's identity
// from it. The role and permissions used for authorization decisions always
// come from the caller's `users/{uid}` document in Firestore — never from the
// cookie's own claims and never from a function argument, since either of
// those could be supplied by the caller. Only import this module from
// server-side code (Server Actions, Route Handlers, Server Components); it is
// not marked 'use server' because its exports are internal guards, not
// endpoints that should be individually callable from the client.
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';

export const SESSION_COOKIE_NAME = 'vforum_session';

export type SessionUser = {
  uid: string;
  email: UserProfile['email'];
  role: NonNullable<UserProfile['role']>;
  permissions: NonNullable<UserProfile['permissions']>;
};

/**
 * Resolves the currently authenticated user from the session cookie.
 *
 * Returns null when there is no cookie, the cookie fails verification
 * (missing, malformed, expired, or revoked), or the caller's Firestore
 * profile document doesn't exist. Callers that need to distinguish "not
 * authenticated" from a hard failure should use requireAuth()/requireAdmin()
 * instead, which throw.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  let uid: string;
  try {
    // checkRevoked: true - a long-lived session cookie is exactly the
    // credential we want to reject promptly once revoked (e.g. after a
    // password change or an admin-initiated sign-out).
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }

  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data()!;
    return {
      uid,
      email: data.email ?? null,
      role: data.role || 'user',
      permissions: data.permissions || ['read_forums', 'create_questions', 'vote'],
    };
  } catch (error) {
    console.error('Error loading session user profile:', error);
    return null;
  }
}

/** Returns the current session user, or throws if there isn't one. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Authentication required.');
  }
  return user;
}

/**
 * Returns the current session user, or throws unless their Firestore-stored
 * role is 'admin'. The role check is against requireAuth()'s result, i.e.
 * freshly loaded from Firestore on every call - never cached from the token.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Admin privileges required.');
  }
  return user;
}
