"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { voteOnQuestion, voteOnComment, getUserVote } from '@/lib/services/voteService';
import { useToast } from '@/hooks/use-toast';

interface VoteButtonsProps {
  initialUpvotes: number;
  initialDownvotes?: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'default';
  id: string; // ID of the item being voted on (question/comment)
  type: 'question' | 'comment'; // Type of item being voted on
  questionId?: string; // Required for comment voting
  mode?: 'upvote' | 'like'; // New prop to control voting mode
  showShare?: boolean; // Whether to show share button
  onShare?: () => void; // Share callback
}

export default function VoteButtons({ 
  initialUpvotes, 
  initialDownvotes = 0, 
  orientation = 'vertical',
  size = 'default',
  id,
  type,
  questionId,
  mode = 'upvote', // Default to upvote mode
  showShare = false,
  onShare,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isLikeMode = mode === 'like';

  // Load user's existing vote
  useEffect(() => {
    if (user?.uid) {
      getUserVote(id, user.uid, type)
        .then(vote => setUserVote(vote))
        .catch(error => console.error('Error loading user vote:', error));
    }
  }, [id, user?.uid, type]);

  const handleVote = async (newVote: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to be signed in to vote.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;

    // In like mode, only handle 'up' votes (likes)
    if (isLikeMode && newVote === 'down') return;

    const finalVote = userVote === newVote ? 'none' : newVote;
    const oldUserVote = userVote;
    
    // Optimistic update
    setUserVote(finalVote);
    
    // Calculate vote changes for optimistic UI update
    let upvoteChange = 0;
    let downvoteChange = 0;
    
    if (oldUserVote === 'up') upvoteChange = -1;
    if (oldUserVote === 'down') downvoteChange = -1;
    
    if (finalVote === 'up') upvoteChange += 1;
    if (finalVote === 'down') downvoteChange += 1;
    
    setUpvotes(prev => prev + upvoteChange);
    if (!isLikeMode) {
      setDownvotes(prev => prev + downvoteChange);
    }

    setIsLoading(true);
    
    try {
      if (type === 'question') {
        await voteOnQuestion(id, user.uid, finalVote);
      } else if (type === 'comment' && questionId) {
        await voteOnComment(questionId, id, user.uid, finalVote);
      }
      
      const actionText = isLikeMode 
        ? (finalVote === 'none' ? "removed like from" : "liked")
        : (finalVote === 'none' ? "removed vote from" : `${finalVote}voted`);
      
      toast({
        title: finalVote === 'none' ? "Vote removed" : "Vote recorded",
        description: `You ${actionText} this ${type}.`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setUserVote(oldUserVote);
      setUpvotes(prev => prev - upvoteChange);
      if (!isLikeMode) {
        setDownvotes(prev => prev - downvoteChange);
      }
      
      console.error('Error voting:', error);
      toast({
        title: "Voting failed",
        description: "Unable to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };
  
  const score = isLikeMode ? upvotes : (upvotes - downvotes);

  return (
    <div className={cn(
      "flex items-center gap-1",
      orientation === 'vertical' ? "flex-col" : "flex-row"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "rounded-full",
            size === 'sm' ? "h-7 w-7" : "h-9 w-9", 
            userVote === 'up' ? (isLikeMode ? 'text-red-500' : 'text-primary') : 'text-muted-foreground hover:text-primary/80',
            isLoading && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleVote('up')}
        disabled={isLoading}
        aria-pressed={userVote === 'up'}
        aria-label={isLikeMode ? "Like" : "Upvote"}
      >
        {isLikeMode ? (
          <Heart className={cn(size === 'sm' ? "h-4 w-4" : "h-5 w-5", userVote === 'up' ? 'fill-red-500' : '')} />
        ) : (
          <ArrowBigUp className={cn(size === 'sm' ? "h-4 w-4" : "h-5 w-5", userVote === 'up' ? 'fill-primary' : '')} />
        )}
      </Button>
      
      <span className={cn(
        "font-semibold tabular-nums", 
        size === 'sm' ? 'text-sm' : 'text-base',
        orientation === 'vertical' ? 'my-0.5' : 'mx-1',
        isLikeMode 
          ? (score > 0 ? "text-red-500" : "text-muted-foreground")
          : (score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : "text-muted-foreground")
      )}>
        {score}
      </span>
      
      {!isLikeMode && initialDownvotes !== undefined && ( 
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full",
            size === 'sm' ? "h-7 w-7" : "h-9 w-9",
            userVote === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive/80',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => handleVote('down')}
          disabled={isLoading}
          aria-pressed={userVote === 'down'}
          aria-label="Downvote"
        >
          <ArrowBigDown className={cn(size === 'sm' ? "h-4 w-4" : "h-5 w-5", userVote === 'down' ? 'fill-destructive' : '')} />
        </Button>
      )}

      {showShare && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full",
            size === 'sm' ? "h-7 w-7" : "h-9 w-9",
            "text-muted-foreground hover:text-primary/80"
          )}
          onClick={handleShare}
          aria-label="Share"
        >
          <Share2 className={cn(size === 'sm' ? "h-4 w-4" : "h-5 w-5")} />
        </Button>
      )}
    </div>
  );
}
