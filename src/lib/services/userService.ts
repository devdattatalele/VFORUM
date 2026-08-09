'use server';
import type { UserProfile } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getPermissionsForRole } from '@/lib/utils/userUtils';
import { requireAdmin } from '@/lib/auth/session';

export async function createUserProfile(user: UserProfile): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user', // Default role
        permissions: ['read_forums', 'create_questions', 'vote'], // Default permissions
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile.');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const data = userDoc.data()!;
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'user',
        permissions: data.permissions || ['read_forums', 'create_questions', 'vote'],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function searchUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const querySnapshot = await adminDb.collection('users').where('email', '==', email).get();

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'user',
        permissions: data.permissions || ['read_forums', 'create_questions', 'vote'],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error searching user by email:', error);
    return null;
  }
}

export async function searchUser(searchTerm: string): Promise<UserProfile | null> {
  try {
    console.log('Searching for user with term:', searchTerm);
    
    // First try to get by UID (UIDs are typically longer than 20 characters)
    if (searchTerm.length > 15) {
      console.log('Trying UID search...');
      const userByUid = await getUserProfile(searchTerm);
      if (userByUid) {
        console.log('Found user by UID:', userByUid.email);
        return userByUid;
      }
    }
    
    // Then try to search by email
    if (searchTerm.includes('@')) {
      console.log('Trying email search...');
      const userByEmail = await searchUserByEmail(searchTerm);
      if (userByEmail) {
        console.log('Found user by email:', userByEmail.email);
        return userByEmail;
      }
    }
    
    console.log('No user found with search term:', searchTerm);
    return null;
  } catch (error) {
    console.error('Error in searchUser:', error);
    return null;
  }
}

// Role ordering used to detect self-escalation below. Higher number = more
// privileged.
const ROLE_RANK: Record<'user' | 'moderator' | 'admin', number> = {
  user: 0,
  moderator: 1,
  admin: 2,
};

export async function updateUserRole(uid: string, role: 'user' | 'moderator' | 'admin'): Promise<void> {
  // Resolves the caller's identity from their session cookie and throws
  // unless their Firestore-stored role is 'admin'. This is the only
  // authorization check that matters: the admin panel's client-side isAdmin()
  // check controls what renders, not what this action will accept.
  const caller = await requireAdmin();

  if (caller.uid === uid && ROLE_RANK[role] > ROLE_RANK[caller.role]) {
    throw new Error('You cannot change your own role to a higher privilege level.');
  }

  try {
    const userRef = adminDb.collection('users').doc(uid);
    const targetDoc = await userRef.get();
    const previousRole = targetDoc.exists ? (targetDoc.data()!.role || 'user') : 'user';
    const permissions = getPermissionsForRole(role);

    await userRef.update({
      role,
      permissions,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection('roleChanges').add({
      actorUid: caller.uid,
      targetUid: uid,
      previousRole,
      newRole: role,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role.');
  }
}

// Debug function to list all users
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await adminDb.collection('users').get();

    const users = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'user',
        permissions: data.permissions || ['read_forums', 'create_questions', 'vote'],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    });
    
    console.log('All users in database:', users);
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
} 