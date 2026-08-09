// Integration coverage for src/lib/auth/session.ts and
// src/app/api/auth/session/route.ts against the real Auth + Firestore
// emulators. This is the load-bearing proof for issue #17: role/permission
// decisions must come from the caller's Firestore users/{uid} document, on
// every call, never from the session cookie's own claims and never cached.
import { describe, it, expect } from 'vitest';
import { cookies } from 'next/headers';
import { getSessionUser, requireAdmin, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { POST, DELETE } from '@/app/api/auth/session/route';
import { signInAs, mintIdTokenFor, establishSessionCookie } from '../helpers/session';
import { __getCapturedCookie } from '../helpers/next-headers-mock';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('getSessionUser', () => {
  it('returns null when there is no session cookie', async () => {
    expect(await getSessionUser()).toBeNull();
  });

  it('returns null for a garbage cookie without throwing', async () => {
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, 'not-a-real-session-cookie');

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it('round-trips through signInAs with default role/permissions when the profile doc omits both', async () => {
    await signInAs('u1');

    expect(await getSessionUser()).toEqual({
      uid: 'u1',
      email: 'u1@example.com',
      role: 'user',
      permissions: ['read_forums', 'create_questions', 'vote'],
    });
  });

  it('fails closed when the Auth user has no Firestore profile document', async () => {
    const idToken = await mintIdTokenFor('ghost-1');
    const response = await establishSessionCookie(idToken);
    expect(response.status).toBe(200);

    expect(await getSessionUser()).toBeNull();
  });

  it('returns null after the underlying refresh tokens are revoked (checkRevoked)', async () => {
    await signInAs('revoke-1');
    await expect(getSessionUser()).resolves.toMatchObject({ uid: 'revoke-1' });

    // Firebase Auth's revocation check compares the session cookie's `iat`
    // against the user's revocation timestamp at one-second resolution, so
    // revoking in the same second the cookie was minted can be a false
    // negative even against real Firebase Auth, not just the emulator - a
    // short wait avoids that specific flake independent of whether the
    // emulator implements checkRevoked at all.
    await sleep(1100);
    await adminAuth.revokeRefreshTokens('revoke-1');

    await expect(getSessionUser()).resolves.toBeNull();
  });
});

describe('requireAdmin', () => {
  it('throws when there is no session', async () => {
    await expect(requireAdmin()).rejects.toThrow('Authentication required.');
  });

  it('throws when the caller is signed in but not an admin', async () => {
    await signInAs('plain-user-1', { role: 'user' });
    await expect(requireAdmin()).rejects.toThrow('Admin privileges required.');
  });

  it('reflects a live Firestore role change, not the token the cookie was minted from', async () => {
    await signInAs('flip-1', { role: 'admin' });
    await expect(requireAdmin()).resolves.toMatchObject({ uid: 'flip-1', role: 'admin' });

    // The session cookie itself is untouched - only the Firestore document
    // changes. If requireAdmin() were trusting anything other than a fresh
    // Firestore read, this would still resolve.
    await adminDb.collection('users').doc('flip-1').update({ role: 'user' });

    await expect(requireAdmin()).rejects.toThrow('Admin privileges required.');
  });
});

describe('POST /api/auth/session', () => {
  it('returns 400 for an empty body', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when idToken is not a string', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 12345 }),
      })
    );
    expect(response.status).toBe(400);
  });

  it('returns 401 for a bogus token and writes no cookie', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'totally-bogus' }),
      })
    );
    expect(response.status).toBe(401);
    expect(__getCapturedCookie(SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it('on success sets an httpOnly/lax/root-path cookie; DELETE then clears it', async () => {
    await signInAs('cookie-opts-1');

    const captured = __getCapturedCookie(SESSION_COOKIE_NAME);
    expect(captured).toBeDefined();
    expect(captured?.options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
    await expect(getSessionUser()).resolves.toMatchObject({ uid: 'cookie-opts-1' });

    const deleteResponse = await DELETE();
    expect(deleteResponse.status).toBe(200);
    expect(__getCapturedCookie(SESSION_COOKIE_NAME)).toBeUndefined();
    await expect(getSessionUser()).resolves.toBeNull();
  });
});
