
'use server';
import type { Comment, UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { updateQuestionOnNewComment } from './questionService'; // Import the new function

interface CommentDataForFirestore extends Omit<Comment, 'id' | 'createdAt' | 'author'> {
  createdAt: Timestamp;
  author: UserProfile;
}

export async function addComment(
  questionId: string,
  commentData: Omit<Comment, 'id' | 'author' | 'createdAt' | 'upvotes' | 'questionId' | 'parentId'>,
  author: UserProfile,
  parentId?: string | null
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, `questions/${questionId}/comments`), {
      ...commentData,
      questionId,
      author,
      parentId: parentId || null,
      createdAt: serverTimestamp(),
      upvotes: 0,
    });
    
    // After successfully adding a comment, update the question's reply count and last activity
    await updateQuestionOnNewComment(questionId);

    return docRef.id;
  } catch (error) {
    console.error('Error adding comment: ', error);
    throw new Error('Failed to add comment.');
  }
}

export async function getCommentsForQuestion(questionId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, `questions/${questionId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
         createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      } as Comment;
    });
  } catch (error) {
    console.error('Error fetching comments: ', error);
    return [];
  }
}
