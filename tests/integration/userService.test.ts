// Integration coverage for updateUserRole (src/lib/services/userService.ts)
// against the real Auth + Firestore emulators. requireAdmin() is the only
// authorization check that matters here - the admin panel's client-side
// isAdmin() check controls what renders, not what this Server Action will
// accept - so these tests exercise the real server-side guard end to end.
import { describe, it, expect } from 'vitest';
import { updateUserRole } from '@/lib/services/userService';
import { adminDb } from '@/lib/firebase-admin';
import { getPermissionsForRole } from '@/lib/utils/userUtils';
import { signInAs } from '../helpers/session';

async function getRoleChanges() {
  const snapshot = await adminDb.collection('roleChanges').get();
  return snapshot.docs.map((doc) => doc.data());
}

describe('updateUserRole', () => {
  it('rejects with no session cookie', async () => {
    await expect(updateUserRole('victim', 'admin')).rejects.toThrow('Authentication required.');
  });

  it('rejects when the caller is a plain user, and makes no writes', async () => {
    await signInAs('caller-user-1', { role: 'user' });
    const victimProfile = { uid: 'victim', role: 'user', permissions: getPermissionsForRole('user') };
    await adminDb.collection('users').doc('victim').set(victimProfile);

    await expect(updateUserRole('victim', 'admin')).rejects.toThrow('Admin privileges required.');

    const victimDoc = await adminDb.collection('users').doc('victim').get();
    expect(victimDoc.data()).toEqual(victimProfile);
    expect(await getRoleChanges()).toEqual([]);
  });

  // NOTE on what this actually exercises: updateUserRole's own
  // self-escalation guard (`caller.uid === uid && ROLE_RANK[role] >
  // ROLE_RANK[caller.role]`) can only run after requireAdmin() has already
  // passed, which means caller.role is always 'admin' - ROLE_RANK's
  // maximum. So `ROLE_RANK[role] > ROLE_RANK['admin']` (2) can never be true
  // for any of the three roles, and this guard cannot currently throw for
  // ANY input - confirmed empirically (this test originally asserted the
  // guard's own message and failed: the real rejection came from
  // requireAdmin() instead). A moderator can't reach the guard at all; they
  // are rejected one line earlier by the admin-only gate. Reported as a
  // discovered dead-code path rather than fixed, per this phase's scope.
  it('a moderator targeting themselves with admin is still rejected (by the admin-only gate)', async () => {
    await signInAs('mod-1', { role: 'moderator' });

    await expect(updateUserRole('mod-1', 'admin')).rejects.toThrow('Admin privileges required.');
  });

  it('an admin may demote themselves to user', async () => {
    await signInAs('admin-self-1', { role: 'admin' });

    await expect(updateUserRole('admin-self-1', 'user')).resolves.toBeUndefined();

    const doc = await adminDb.collection('users').doc('admin-self-1').get();
    expect(doc.data()?.role).toBe('user');
  });

  it('an admin caller succeeds: target role/permissions updated, exactly one roleChanges document recorded', async () => {
    await signInAs('admin-1', { role: 'admin' });
    await adminDb
      .collection('users')
      .doc('target-1')
      .set({ uid: 'target-1', role: 'user', permissions: getPermissionsForRole('user') });

    await updateUserRole('target-1', 'moderator');

    const targetDoc = await adminDb.collection('users').doc('target-1').get();
    expect(targetDoc.data()?.role).toBe('moderator');
    expect(targetDoc.data()?.permissions).toEqual(getPermissionsForRole('moderator'));

    const changes = await getRoleChanges();
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      actorUid: 'admin-1',
      targetUid: 'target-1',
      previousRole: 'user',
      newRole: 'moderator',
    });
    expect(changes[0].createdAt).toBeDefined();
  });
});
