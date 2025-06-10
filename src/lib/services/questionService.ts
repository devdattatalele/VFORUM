'use server';
import type { Question, UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, query, where, serverTimestamp, Timestamp, updateDoc, increment, deleteDoc } from 'firebase/firestore';

interface QuestionDataForFirestore extends Omit<Question, 'id' | 'createdAt' | 'author' | 'lastActivityAt'> {
  createdAt: Timestamp;
  author: UserProfile;
  lastActivityAt: Timestamp;
}

export async function addQuestion(
  questionData: Omit<Question, 'id' | 'upvotes' | 'downvotes' | 'author' | 'createdAt' | 'views' | 'replyCount' | 'lastActivityAt'>,
  author: UserProfile
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...questionData,
      author,
      createdAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      views: 0,
      replyCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding question: ', error);
    throw new Error('Failed to add question.');
  }
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'questions'));
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        lastActivityAt: data.lastActivityAt?.toDate ? data.lastActivityAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
      } as Question;
    });
  } catch (error) {
    console.error('Error fetching questions: ', error);
    return [];
  }
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  try {
    const docRef = doc(db, 'questions', questionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Increment views in database
      await updateDoc(docRef, {
          views: increment(1)
      });
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Don't increment views locally since it's already done in database
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        lastActivityAt: data.lastActivityAt?.toDate ? data.lastActivityAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
      } as Question;
    }
    return null;
  } catch (error) {
    console.error('Error fetching question by ID: ', error);
    return null;
  }
}

export async function getQuestionsByCommunity(communityId: string): Promise<Question[]> {
  try {
    const q = query(collection(db, 'questions'), where('communityId', '==', communityId));
    const querySnapshot = await getDocs(q);
     return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        lastActivityAt: data.lastActivityAt?.toDate ? data.lastActivityAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
      } as Question;
    });
  } catch (error) {
    console.error('Error fetching questions by community: ', error);
    return [];
  }
}

export async function updateQuestion(
  questionId: string,
  updates: {
    title?: string;
    content?: string;
    tags?: string[];
  },
  userId: string
): Promise<void> {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating question: ', error);
    throw new Error('Failed to update question.');
  }
}

// Function to update reply count and last activity
export async function updateQuestionOnNewComment(questionId: string): Promise<void> {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      replyCount: increment(1),
      lastActivityAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating question on new comment: ', error);
    // Potentially throw or handle more gracefully
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Error deleting question: ', error);
    throw new Error('Failed to delete question.');
  }
}
