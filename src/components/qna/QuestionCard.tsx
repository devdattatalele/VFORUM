"use client";

import Link from 'next/link';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Tag as TagIcon, CalendarDays, UserCircle, Eye, ArrowUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VoteButtons from './VoteButtons';
import { COMMUNITIES } from '@/lib/constants';
import React from 'react';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const community = COMMUNITIES.find(c => c.id === question.communityId);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground min-w-0 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={question.author.photoURL || undefined} alt={question.author.displayName || 'User'} />
              <AvatarFallback>
                {question.author.displayName ? question.author.displayName.charAt(0).toUpperCase() : <UserCircle size={16} />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-foreground truncate">{question.author.displayName}</span>
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                {community && (
                  <>
                    <span>•</span>
                    <Badge variant="community" className="px-1.5 py-0.5 text-xs flex-shrink-0">
                      {community.icon && <community.icon className="mr-1 h-3 w-3" />}
                      {community.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
            <Eye className="h-3 w-3" />
            <span>{question.views || 0}</span>
          </div>
        </div>
        <Link href={`/qna/${question.id}`} className="block group">
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mt-3 line-clamp-2 leading-tight">
            {question.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="py-0 pb-4">
        <CardDescription className="text-sm text-foreground/80 line-clamp-2 mb-3 leading-relaxed">
          {question.content}
        </CardDescription>
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {question.tags.slice(0, 4).map(tag => ( 
              <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors cursor-pointer">
                  <TagIcon className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              </Link>
            ))}
            {question.tags.length > 4 && <Badge variant="secondary" className="text-xs">+{question.tags.length - 4} more</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium tabular-nums">{question.upvotes || 0}</span>
          </div>
          <Link href={`/qna/${question.id}#comments`} className="flex items-center gap-1 hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="tabular-nums">{question.replyCount || 0}</span>
          </Link>
        </div>
        <span className="text-xs text-muted-foreground">
          Last activity {formatDistanceToNow(new Date(question.lastActivityAt || question.createdAt), { addSuffix: true })}
        </span>
      </CardFooter>
    </Card>
  );
}
