
"use client";

import type { Comment as CommentType } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from './VoteButtons';
import { UserCircle, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import React from "react"; // Added React import

interface CommentCardProps {
  comment: CommentType;
}

export default function CommentCard({ comment }: CommentCardProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-md border border-white/10 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author.photoURL || undefined} alt={comment.author.displayName || 'Author'} />
            <AvatarFallback className="text-xs">
              {comment.author.displayName ? comment.author.displayName.charAt(0).toUpperCase() : <UserCircle size={12}/>}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{comment.author.displayName || 'Anonymous'}</span>
          <span className="text-muted-foreground/70">&bull;</span>
          <CalendarDays className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
      </CardContent>
      <CardFooter className="px-4 pb-3 pt-2">
        <VoteButtons 
            initialUpvotes={comment.upvotes} 
            // initialDownvotes={0} // Assuming comments don't have downvotes in this mock data
            id={comment.id}
            orientation="horizontal"
            size="sm"
        />
        {/* Reply button can be added here if threading is implemented further */}
        {/* <Button variant="ghost" size="sm" className="ml-auto text-xs">Reply</Button> */}
      </CardFooter>
    </Card>
  );
}
