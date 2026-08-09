import { describe, it, expect } from 'vitest';
import { getPermissionsForRole, hasPermission, isModerator, isAdmin } from '@/lib/utils/userUtils';
import type { UserProfile } from '@/lib/types';

describe('getPermissionsForRole', () => {
  it('admin includes manage_users and delete_content', () => {
    const permissions = getPermissionsForRole('admin');
    expect(permissions).toContain('manage_users');
    expect(permissions).toContain('delete_content');
  });

  it('moderator includes neither manage_users nor delete_content', () => {
    const permissions = getPermissionsForRole('moderator');
    expect(permissions).not.toContain('manage_users');
    expect(permissions).not.toContain('delete_content');
  });

  it('user is exactly the three default permissions', () => {
    expect(getPermissionsForRole('user')).toEqual(['read_forums', 'create_questions', 'vote']);
  });

  it('an unrecognised role falls through to the user branch', () => {
    // Deliberately bypass the parameter type to exercise the switch's
    // runtime default branch, which handles data outside the union.
    const invalidRole = 'superadmin' as unknown as 'user';
    expect(getPermissionsForRole(invalidRole)).toEqual(['read_forums', 'create_questions', 'vote']);
  });
});

describe('hasPermission', () => {
  it('is false for a null user', () => {
    expect(hasPermission(null, 'vote')).toBe(false);
  });

  it('is false for a user object with no permissions field', () => {
    expect(hasPermission({} as any, 'vote')).toBe(false);
  });

  it('is true when the permission is present', () => {
    const user = { permissions: ['vote'] } as UserProfile;
    expect(hasPermission(user, 'vote')).toBe(true);
  });

  it('is false when the permission is absent', () => {
    const user = { permissions: ['vote'] } as UserProfile;
    expect(hasPermission(user, 'manage_users')).toBe(false);
  });
});

describe('isModerator / isAdmin truth table', () => {
  const asUser = (role: UserProfile['role']): UserProfile => ({
    uid: 'u1',
    email: 'u1@vit.edu.in',
    displayName: 'Test User',
    photoURL: null,
    role,
  });

  it('admin: isModerator=true, isAdmin=true', () => {
    const user = asUser('admin');
    expect(isModerator(user)).toBe(true);
    expect(isAdmin(user)).toBe(true);
  });

  it('moderator: isModerator=true, isAdmin=false', () => {
    const user = asUser('moderator');
    expect(isModerator(user)).toBe(true);
    expect(isAdmin(user)).toBe(false);
  });

  it('user: isModerator=false, isAdmin=false', () => {
    const user = asUser('user');
    expect(isModerator(user)).toBe(false);
    expect(isAdmin(user)).toBe(false);
  });

  it('null: isModerator=false, isAdmin=false', () => {
    expect(isModerator(null)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
