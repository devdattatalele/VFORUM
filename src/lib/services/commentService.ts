'use server';
import type { Comment, UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, where, doc, updateDoc } from 'firebase/firestore';
import { updateQuestionOnNewComment } from './questionService';

interface CommentDataForFirestore extends Omit<Comment, 'id' | 'createdAt' | 'author'> {
  createdAt: Timestamp;
  author: UserProfile;
}

export async function addComment(
  questionId: string,
  commentData: Omit<Comment, 'id' | 'author' | 'createdAt' | 'upvotes' | 'downvotes' | 'questionId' | 'parentId'>,
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
      downvotes: 0,
    });
    
    // After successfully adding a comment, update the question's reply count and last activity
    await updateQuestionOnNewComment(questionId);

    return docRef.id;
  } catch (error) {
    console.error('Error adding comment: ', error);
    throw new Error('Failed to add comment.');
  }
}

export async function getCommentsForQuestion(questionId: string, sortBy: string = 'newest'): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, `questions/${questionId}/comments`);
    let q;
    
    // Add sorting options
    switch (sortBy) {
      case 'oldest':
        q = query(commentsRef, orderBy('createdAt', 'asc'));
        break;
      case 'top':
        q = query(commentsRef, orderBy('upvotes', 'desc'));
        break;
      case 'controversial':
        // For controversial, we'll sort by most total votes (upvotes + downvotes)
        // Since Firestore doesn't support computed fields, we'll sort client-side
        q = query(commentsRef, orderBy('createdAt', 'desc'));
        break;
      case 'newest':
      default:
        q = query(commentsRef, orderBy('createdAt', 'desc'));
        break;
    }
    
    const querySnapshot = await getDocs(q);
    let comments = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      } as Comment;
    });
    
    // Handle controversial sorting client-side
    if (sortBy === 'controversial') {
      comments = comments.sort((a, b) => {
        const aTotal = (a.upvotes || 0) + (a.downvotes || 0);
        const bTotal = (b.upvotes || 0) + (b.downvotes || 0);
        return bTotal - aTotal;
      });
    }
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments: ', error);
    return [];
  }
}

export async function getThreadedComments(questionId: string, sortBy: string = 'newest'): Promise<Comment[]> {
  try {
    const comments = await getCommentsForQuestion(questionId, sortBy);
    
    // Return all comments as-is for the buildCommentTree function to handle
    // The buildCommentTree function in the component will create proper nesting
    return comments;
  } catch (error) {
    console.error('Error fetching threaded comments: ', error);
    return [];
  }
}

export async function updateComment(
  questionId: string,
  commentId: string,
  content: string,
  userId: string
): Promise<void> {
  try {
    const commentRef = doc(db, `questions/${questionId}/comments`, commentId);
    await updateDoc(commentRef, {
      content,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating comment: ', error);
    throw new Error('Failed to update comment.');
  }
}
