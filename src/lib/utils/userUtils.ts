import type { UserProfile } from '@/lib/types';

// Utility functions - these don't need 'use server' and should be synchronous
export function getPermissionsForRole(role: 'user' | 'moderator' | 'admin'): string[] {
  switch (role) {
    case 'admin':
      return [
        'read_forums',
        'create_questions',
        'vote',
        'create_events',
        'manage_events',
        'manage_users',
        'moderate_forums',
        'delete_content'
      ];
    case 'moderator':
      return [
        'read_forums',
        'create_questions',
        'vote',
        'create_events',
        'manage_events',
        'moderate_forums'
      ];
    case 'user':
    default:
      return [
        'read_forums',
        'create_questions',
        'vote'
      ];
  }
}

export function hasPermission(user: UserProfile | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

export function isModerator(user: UserProfile | null): boolean {
  return user?.role === 'moderator' || user?.role === 'admin';
}

export function isAdmin(user: UserProfile | null): boolean {
  return user?.role === 'admin';
} 