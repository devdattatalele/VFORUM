// Mints and clears the httpOnly session cookie that server-side auth guards
// (see src/lib/auth/session.ts) read to resolve caller identity. This is a
// Route Handler rather than a Server Action because it needs to set response
// cookies from a plain client fetch() call independent of any form/action
// submission - see src/contexts/AuthContext.tsx for the call sites.
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

// Firebase session cookies allow a minimum of 5 minutes and a maximum of 2
// weeks. 5 days balances not forcing frequent re-logins against limiting how
// long a stolen cookie stays valid.
const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!idToken || typeof idToken !== 'string') {
    return Response.json({ error: 'idToken is required.' }, { status: 400 });
  }

  try {
    // Confirm this is a genuine, currently-valid Firebase ID token before
    // exchanging it for a longer-lived session cookie.
    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });

    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return Response.json({ error: 'Failed to create session.' }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ status: 'ok' });
}
