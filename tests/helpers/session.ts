// Mints a real, end-to-end authenticated session against the emulators and
// lands the resulting cookie in the shared mock jar (see
// tests/helpers/next-headers-mock.ts), so integration tests can call
// src/lib/auth/session.ts's exports afterwards exactly as production code
// would. Only the HTTP transport between "browser" and "server" is faked
// (via the cookie jar mock); every token this module mints or exchanges is
// genuine and goes through the real Auth emulator and the real
// POST /api/auth/session handler - the jar itself never fabricates a cookie
// value.
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getPermissionsForRole } from '@/lib/utils/userUtils';
import { POST } from '@/app/api/auth/session/route';

type Role = 'user' | 'moderator' | 'admin';

/**
 * Ensures uid exists as an emulator Auth user, mints a custom token for it,
 * and exchanges that for a real ID token via the Auth emulator's REST
 * signInWithCustomToken endpoint (the Admin SDK can mint custom tokens but,
 * same as production, cannot itself produce an ID token - only a client
 * sign-in can).
 */
export async function mintIdTokenFor(uid: string): Promise<string> {
  try {
    await adminAuth.getUser(uid);
  } catch {
    await adminAuth.createUser({ uid, email: `${uid}@example.com` });
  }

  const customToken = await adminAuth.createCustomToken(uid);

  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=any`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  if (!response.ok) {
    throw new Error(
      `mintIdTokenFor(${uid}): Auth emulator token exchange failed (${response.status}): ` +
        (await response.text())
    );
  }
  const { idToken } = (await response.json()) as { idToken: string };
  return idToken;
}

/** Calls the real POST /api/auth/session handler with a genuine ID token. */
export async function establishSessionCookie(idToken: string): Promise<Response> {
  return POST(
    new Request('http://localhost/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
  );
}

/**
 * Signs in as uid: creates the emulator Auth user if needed, optionally
 * writes a users/{uid} Firestore profile, then runs the real session-cookie
 * mint flow so the shared cookie jar ends up holding a genuine session
 * cookie for uid.
 *
 * When options.role is omitted, the users/{uid} doc is written WITHOUT a
 * role or permissions field on purpose, so tests can exercise
 * getSessionUser()'s own default-fallback behaviour rather than this helper
 * pre-supplying the defaults.
 */
export async function signInAs(uid: string, options: { role?: Role } = {}): Promise<void> {
  const idToken = await mintIdTokenFor(uid);

  const profile: Record<string, unknown> = { uid, email: `${uid}@example.com` };
  if (options.role) {
    profile.role = options.role;
    profile.permissions = getPermissionsForRole(options.role);
  }
  await adminDb.collection('users').doc(uid).set(profile);

  const response = await establishSessionCookie(idToken);
  if (!response.ok) {
    throw new Error(`signInAs(${uid}): session route responded ${response.status}`);
  }
}
