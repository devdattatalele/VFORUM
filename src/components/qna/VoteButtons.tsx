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
      // For simplicity, we pass the current vote type or 'none' if unvoting
      // A more complex onVote might require prev/next state
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
        size={size === 'sm' ? 'icon-sm' : 'icon'} // Assuming 'icon-sm' is defined or use 'sm' for button
        className={cn("p-1 h-auto", voteStatus === 'up' ? 'text-primary' : 'text-muted-foreground hover:text-primary/80')}
        onClick={() => handleVote('up')}
        aria-pressed={voteStatus === 'up'}
        aria-label="Upvote"
      >
        <ArrowBigUp className={cn("h-5 w-5", voteStatus === 'up' ? 'fill-primary' : '')} />
      </Button>
      <span className={cn(
        "font-semibold tabular-nums", 
        size === 'sm' ? 'text-sm' : 'text-base',
        orientation === 'vertical' ? 'my-0.5' : 'mx-1',
        score > 0 ? "text-green-600" : score < 0 ? "text-red-600" : "text-muted-foreground"
      )}>
        {score}
      </span>
      {initialDownvotes !== undefined && ( // Only show downvote if initialDownvotes is provided as not 0 (or if it's meant to be a feature)
        <Button
          variant="ghost"
          size={size === 'sm' ? 'icon-sm' : 'icon'}
          className={cn("p-1 h-auto", voteStatus === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive/80')}
          onClick={() => handleVote('down')}
          aria-pressed={voteStatus === 'down'}
          aria-label="Downvote"
        >
          <ArrowBigDown className={cn("h-5 w-5", voteStatus === 'down' ? 'fill-destructive' : '')} />
