'use server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface VoteData {
  questionId?: string;
  commentId?: string;
  userId: string;
  voteType: 'up' | 'down' | 'none';
}

export async function voteOnQuestion(questionId: string, userId: string, voteType: 'up' | 'down' | 'none'): Promise<void> {
  try {
    const voteRef = adminDb.doc(`votes/questions/${questionId}/${userId}`);
    const questionRef = adminDb.collection('questions').doc(questionId);

    // Get existing vote
    const existingVote = await voteRef.get();
    const currentVote = existingVote.exists ? existingVote.data()?.voteType : 'none';

    if (currentVote === voteType) {
      return; // No change needed
    }

    // Update vote record
    if (voteType === 'none') {
      await voteRef.set({ voteType: 'none', updatedAt: new Date() });
    } else {
      await voteRef.set({ voteType, updatedAt: new Date() });
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
    if (upvoteChange !== 0) updateData.upvotes = FieldValue.increment(upvoteChange);
    if (downvoteChange !== 0) updateData.downvotes = FieldValue.increment(downvoteChange);

    if (Object.keys(updateData).length > 0) {
      await questionRef.update(updateData);
    }
  } catch (error) {
    console.error('Error voting on question:', error);
    throw new Error('Failed to vote on question');
  }
}

export async function voteOnComment(questionId: string, commentId: string, userId: string, voteType: 'up' | 'down' | 'none'): Promise<void> {
  try {
    const voteRef = adminDb.doc(`votes/comments/${commentId}/${userId}`);
    const commentRef = adminDb.collection(`questions/${questionId}/comments`).doc(commentId);

    // Get existing vote
    const existingVote = await voteRef.get();
    const currentVote = existingVote.exists ? existingVote.data()?.voteType : 'none';

    if (currentVote === voteType) {
      return; // No change needed
    }

    // Update vote record
    if (voteType === 'none') {
      await voteRef.set({ voteType: 'none', updatedAt: new Date() });
    } else {
      await voteRef.set({ voteType, updatedAt: new Date() });
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
    if (upvoteChange !== 0) updateData.upvotes = FieldValue.increment(upvoteChange);
    if (downvoteChange !== 0) updateData.downvotes = FieldValue.increment(downvoteChange);

    if (Object.keys(updateData).length > 0) {
      await commentRef.update(updateData);
    }
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw new Error('Failed to vote on comment');
  }
}

export async function getUserVote(itemId: string, userId: string, itemType: 'question' | 'comment'): Promise<'up' | 'down' | 'none'> {
  try {
    const voteRef = adminDb.doc(`votes/${itemType}s/${itemId}/${userId}`);
    const voteDoc = await voteRef.get();

    if (voteDoc.exists) {
      return voteDoc.data()?.voteType || 'none';
    }
    return 'none';
  } catch (error) {
    console.error('Error getting user vote:', error);
    return 'none';
  }
} 