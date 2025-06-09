
"use client";

import Link from 'next/link';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Keep for potential other uses, but not for list item
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Tag as TagIcon, CalendarDays, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VoteButtons from './VoteButtons';
import { COMMUNITIES } from '@/lib/constants';
import React, { useState, useEffect } from 'react'; 

// This component is now less of a "Card" and more of a display item,
// especially if QuestionList renders rows directly.
// For now, keeping the structure but it will be styled differently or its logic moved.

interface QuestionCardProps {
  question: Question;
  // commentCount is now part of Question type as replyCount
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const community = COMMUNITIES.find(c => c.id === question.communityId);

  // This is the old card-based rendering. The new table view in QuestionList.tsx
  // will handle the layout. This component might be used for a different view
  // or its content parts used in the table rows. For now, leaving it as is
  // but noting it's not directly used by the new QuestionList table.
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/qna/${question.id}`} legacyBehavior passHref>
            <a className="block">
              <CardTitle className="text-lg font-headline mb-1 hover:text-primary transition-colors">
                {question.title}
              </CardTitle>
            </a>
          </Link>
          {community && (
             <Badge variant="outline" className="ml-2 whitespace-nowrap">
                {community.icon && <community.icon className="mr-1 h-3 w-3 text-muted-foreground"/>}
                {community.name}
             </Badge>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={question.author.photoURL || undefined} alt={question.author.displayName || 'Author'} />
            <AvatarFallback className="text-xs">
              {question.author.displayName ? question.author.displayName.charAt(0).toUpperCase() : <UserCircle size={12}/>}
            </AvatarFallback>
          </Avatar>
          <span>{question.author.displayName || 'Anonymous'}</span>
          <span className="text-muted-foreground/50">&bull;</span>
          <CalendarDays className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent className="py-0 pb-3">
        <CardDescription className="text-sm text-foreground/80 line-clamp-2 mb-2">
          {question.content}
        </CardDescription>
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {question.tags.slice(0, 4).map(tag => ( 
              <Badge key={tag} variant="secondary" className="text-xs">
                <TagIcon className="mr-1 h-3 w-3" /> {tag}
              </Badge>
            ))}
            {question.tags.length > 4 && <Badge variant="secondary" className="text-xs">...</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between items-center pt-3 border-t">
        <VoteButtons 
            initialUpvotes={question.upvotes} 
            initialDownvotes={question.downvotes} 
            id={question.id}
            orientation="horizontal"
            size="sm"
        />
        <Link href={`/qna/${question.id}#comments`} className="flex items-center hover:text-primary transition-colors">
          <MessageSquare className="mr-1 h-4 w-4" />
          <span>{question.replyCount || 0} Answer{question.replyCount === 1 ? '' : 's'}</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
