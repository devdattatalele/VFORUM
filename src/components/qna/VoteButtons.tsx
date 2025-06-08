"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  initialUpvotes: number;
  initialDownvotes?: number; // Optional if only upvotes are shown
  onVote?: (voteType: 'up' | 'down' | 'none') => void; // 'none' for unvoting
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'default';
  id: string; // ID of the item being voted on (question/comment)
}

export default function VoteButtons({ 
  initialUpvotes, 
  initialDownvotes = 0, 
  onVote,
  orientation = 'vertical',
  size = 'default',
  id,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null); // 'up', 'down', or null

  const handleVote = (newVote: 'up' | 'down') => {
    let finalVoteStatus: 'up' | 'down' | null = null;

    if (voteStatus === newVote) { // Unvoting
      setVoteStatus(null);
      finalVoteStatus = null;
      if (newVote === 'up') setUpvotes(prev => prev - 1);
      else setDownvotes(prev => prev - 1);
    } else { // New vote or changing vote
      setVoteStatus(newVote);
      finalVoteStatus = newVote;
      if (newVote === 'up') {
        setUpvotes(prev => prev + 1);
        if (voteStatus === 'down') setDownvotes(prev => prev - 1); // Remove previous downvote
      } else { // Downvote
        setDownvotes(prev => prev + 1);
        if (voteStatus === 'up') setUpvotes(prev => prev - 1); // Remove previous upvote
      }
    }
    
    if (onVote) {
      onVote(finalVoteStatus || 'none');
    }
  };
  
  const score = upvotes - downvotes;

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
            voteStatus === 'up' ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
        )}
        onClick={() => handleVote('up')}
        aria-pressed={voteStatus === 'up'}
        aria-label="Upvote"
      >
        <ArrowBigUp className={cn(size === 'sm' ? "h-4 w-4" : "h-5 w-5", voteStatus === 'up' ? 'fill-primary' : '')} />
      </Button>
      <span className={cn(
        "font-semibold tabular-nums", 
        size === 'sm' ? 'text-sm' : 'text-base',
        orientation === 'vertical' ? 'my-0.5' : 'mx-1',
        score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : "text-muted-foreground"
      )}>
        {score}
      </span>
      {initialDownvotes !== undefined && ( 
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full",
            size === 'sm' ? "h-7 w-7" : "h-9 w-9",
            voteStatus === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive/80'
          )}
          onClick={() => handleVote('down')}
          aria-pressed={voteStatus === 'down'}
          aria-label="Downvote"
        >
          <ArrowBigDown className={cn(size === 'sm' ? "h-4 w-4" : "h-5 w-5", voteStatus === 'down' ? 'fill-destructive' : '')} />
        </Button>
      )}
    </div>
  );
}
