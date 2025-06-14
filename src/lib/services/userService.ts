'use server';
import type { UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { getPermissionsForRole } from '@/lib/utils/userUtils';

export async function createUserProfile(user: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user', // Default role
        permissions: ['read_forums', 'create_questions', 'vote'], // Default permissions
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile.');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
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
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
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

export async function updateUserRole(uid: string, role: 'user' | 'moderator' | 'admin'): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const permissions = getPermissionsForRole(role);
    
    await updateDoc(userRef, {
      role,
      permissions,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role.');
  }
}

// Debug function to list all users
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
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