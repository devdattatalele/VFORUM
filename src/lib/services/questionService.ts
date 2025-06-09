
'use server';
import type { Question, UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';

interface QuestionDataForFirestore extends Omit<Question, 'id' | 'createdAt' | 'author'> {
  createdAt: Timestamp;
  author: UserProfile;
}

export async function addQuestion(
  questionData: Omit<Question, 'id' | 'upvotes' | 'downvotes' | 'author' | 'createdAt'>,
  author: UserProfile
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...questionData,
      author,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
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
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
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
      } as Question;
    });
  } catch (error) {
    console.error('Error fetching questions by community: ', error);
    return [];
  }
}
