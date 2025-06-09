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

  return (
    <Card className="p-0 border-0 bg-transparent shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src={question.author.photoURL || undefined} alt={question.author.displayName || 'User'} />
              <AvatarFallback>
                {question.author.displayName ? question.author.displayName.charAt(0).toUpperCase() : <UserCircle size={16} />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{question.author.displayName}</span>
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                {community && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="px-1.5 py-0.5 text-xs border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                      {community.icon && <community.icon className="mr-1 h-3 w-3" />}
                      {community.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {question.views || 0} views
          </div>
        </div>
        <Link href={`/qna/${question.id}`} className="block group">
          <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mt-3 line-clamp-2">
            {question.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="py-0 pb-3">
        <CardDescription className="text-sm text-foreground/80 line-clamp-2 mb-2">
          {question.content}
        </CardDescription>
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {question.tags.slice(0, 4).map(tag => ( 
              <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors cursor-pointer">
                  <TagIcon className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              </Link>
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
            type="question"
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
