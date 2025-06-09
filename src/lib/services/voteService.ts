'use server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

export interface VoteData {
  questionId?: string;
  commentId?: string;
  userId: string;
  voteType: 'up' | 'down' | 'none';
}

export async function voteOnQuestion(questionId: string, userId: string, voteType: 'up' | 'down' | 'none'): Promise<void> {
  try {
    const voteRef = doc(db, `votes/questions/${questionId}/${userId}`);
    const questionRef = doc(db, 'questions', questionId);
    
    // Get existing vote
    const existingVote = await getDoc(voteRef);
    const currentVote = existingVote.exists() ? existingVote.data()?.voteType : 'none';
    
    if (currentVote === voteType) {
      return; // No change needed
    }
    
    // Update vote record
    if (voteType === 'none') {
      await setDoc(voteRef, { voteType: 'none', updatedAt: new Date() });
    } else {
      await setDoc(voteRef, { voteType, updatedAt: new Date() });
    }
    
    // Calculate vote changes
    let upvoteChange = 0;
    let downvoteChange = 0;
    
    if (currentVote === 'up') upvoteChange = -1;
    if (currentVote === 'down') downvoteChange = -1;
    
    if (voteType === 'up') upvoteChange += 1;
    if (voteType === 'down') downvoteChange += 1;
    
    // Update question vote counts
    const updateData: any = {};
    if (upvoteChange !== 0) updateData.upvotes = increment(upvoteChange);
    if (downvoteChange !== 0) updateData.downvotes = increment(downvoteChange);
    
    if (Object.keys(updateData).length > 0) {
      await updateDoc(questionRef, updateData);
    }
  } catch (error) {
    console.error('Error voting on question:', error);
    throw new Error('Failed to vote on question');
  }
}

export async function voteOnComment(questionId: string, commentId: string, userId: string, voteType: 'up' | 'down' | 'none'): Promise<void> {
  try {
    const voteRef = doc(db, `votes/comments/${commentId}/${userId}`);
    const commentRef = doc(db, `questions/${questionId}/comments`, commentId);
    
    // Get existing vote
    const existingVote = await getDoc(voteRef);
    const currentVote = existingVote.exists() ? existingVote.data()?.voteType : 'none';
    
    if (currentVote === voteType) {
      return; // No change needed
    }
    
    // Update vote record
    if (voteType === 'none') {
      await setDoc(voteRef, { voteType: 'none', updatedAt: new Date() });
    } else {
      await setDoc(voteRef, { voteType, updatedAt: new Date() });
    }
    
    // Calculate vote changes
    let upvoteChange = 0;
    let downvoteChange = 0;
    
    if (currentVote === 'up') upvoteChange = -1;
    if (currentVote === 'down') downvoteChange = -1;
    
    if (voteType === 'up') upvoteChange += 1;
    if (voteType === 'down') downvoteChange += 1;
    
    // Update comment vote counts
    const updateData: any = {};
    if (upvoteChange !== 0) updateData.upvotes = increment(upvoteChange);
    if (downvoteChange !== 0) updateData.downvotes = increment(downvoteChange);
    
    if (Object.keys(updateData).length > 0) {
      await updateDoc(commentRef, updateData);
    }
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw new Error('Failed to vote on comment');
  }
}

export async function getUserVote(itemId: string, userId: string, itemType: 'question' | 'comment'): Promise<'up' | 'down' | 'none'> {
  try {
    const voteRef = doc(db, `votes/${itemType}s/${itemId}/${userId}`);
    const voteDoc = await getDoc(voteRef);
    
    if (voteDoc.exists()) {
      return voteDoc.data()?.voteType || 'none';
    }
    return 'none';
  } catch (error) {
    console.error('Error getting user vote:', error);
    return 'none';
  }
} 