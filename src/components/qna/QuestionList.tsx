"use client";

import type { Question } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListFilter, PlusCircle, Search, HelpCircle, Loader2, MessageSquare, Eye, GitCommitVertical, TrendingUp, Pin, ArrowUp } from 'lucide-react'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from 'react';
import { getQuestions } from '@/lib/services/questionService';
import { COMMUNITIES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function QuestionList() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const communityFilter = searchParams.get('community');
  const tagFilter = searchParams.get('tag');
  const searchFromUrl = searchParams.get('search');
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || '');
  const [sortBy, setSortBy] = useState('activity-desc'); // 'activity-desc', 'activity-asc', 'recent-desc', 'recent-asc', 'popular-desc', 'replies-desc', 'upvotes-desc'
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedQuestions = await getQuestions();
        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Could not load questions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Update search term when URL parameter changes
  useEffect(() => {
    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchFromUrl]);

  const filteredQuestions = React.useMemo(() => {
    let processedQuestions = questions;
    if (communityFilter && communityFilter !== 'all') {
      processedQuestions = processedQuestions.filter(q => q.communityId === communityFilter);
    }
    if (tagFilter) {
      processedQuestions = processedQuestions.filter(q => q.tags.includes(tagFilter));
    }
    if (searchTerm) {
      processedQuestions = processedQuestions.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return processedQuestions.sort((a, b) => {
      const aActivity = a.lastActivityAt || a.createdAt;
      const bActivity = b.lastActivityAt || b.createdAt;

      switch (sortBy) {
        case 'recent-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'recent-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'activity-desc':
          return new Date(bActivity).getTime() - new Date(aActivity).getTime();
        case 'activity-asc':
          return new Date(aActivity).getTime() - new Date(bActivity).getTime();
        case 'popular-desc': // by views
          return (b.views || 0) - (a.views || 0);
        case 'replies-desc':
            return (b.replyCount || 0) - (a.replyCount || 0);
        case 'upvotes-desc':
            return (b.upvotes || 0) - (a.upvotes || 0);
        default:
          return new Date(bActivity).getTime() - new Date(aActivity).getTime();
      }
    });

  }, [questions, communityFilter, tagFilter, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <HelpCircle className="mx-auto h-12 w-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-lg bg-background/80 dark:bg-background/50 sticky top-[calc(var(--header-height,64px)+1rem)] z-30 border-b border-border">
        <div className="relative w-full sm:max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
            placeholder="Search questions..." 
            className="pl-10 bg-background/70 focus:bg-background dark:bg-background/70 dark:focus:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
       
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/70 focus:bg-background dark:bg-background/70 dark:focus:bg-background">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity-desc">Last Activity (Newest)</SelectItem>
              <SelectItem value="activity-asc">Last Activity (Oldest)</SelectItem>
              <SelectItem value="recent-desc">Created (Newest)</SelectItem>
              <SelectItem value="recent-asc">Created (Oldest)</SelectItem>
              <SelectItem value="upvotes-desc">Most Upvoted</SelectItem>
              <SelectItem value="popular-desc">Views</SelectItem>
              <SelectItem value="replies-desc">Replies</SelectItem>
            </SelectContent>
          </Select>
          {user ? (
            <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/qna/ask">
                <PlusCircle className="mr-2 h-4 w-4" /> Ask Question
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/auth">
                <PlusCircle className="mr-2 h-4 w-4" /> Sign In to Ask
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Display current filters */}
      {(tagFilter || communityFilter) && (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          {tagFilter && (
            <Badge variant="outline" className="bg-primary/10">
              Tag: {tagFilter}
              <Link href="/qna" className="ml-2 hover:text-destructive">×</Link>
            </Badge>
          )}
          {communityFilter && communityFilter !== 'all' && (
            <Badge variant="community" className="py-0.5 px-1.5">
              Community: {COMMUNITIES.find(c => c.id === communityFilter)?.name || communityFilter}
              <Link href="/qna" className="ml-2 hover:text-destructive">×</Link>
            </Badge>
          )}
        </div>
      )}

      {filteredQuestions.length > 0 ? (
        <Table className="mt-0">
          <TableHeader>
            <TableRow className="border-b-border hover:bg-transparent">
              <TableHead className="w-[50%] text-muted-foreground font-semibold">Topic</TableHead>
              <TableHead className="text-center text-muted-foreground font-semibold">Upvotes</TableHead>
              <TableHead className="text-center text-muted-foreground font-semibold">Replies</TableHead>
              <TableHead className="text-center text-muted-foreground font-semibold">Views</TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold">Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map(question => {
              const community = COMMUNITIES.find(c => c.id === question.communityId);
              return (
                <TableRow key={question.id} className="border-b-border hover:bg-muted/30 dark:hover:bg-muted/10">
                  <TableCell className="py-3 align-top">
                    <Link href={`/qna/${question.id}`} className="block group">
                      <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
                        {/* {question.tags.includes('pinned') && <Pin className="inline-block mr-1.5 h-4 w-4 text-accent" />} Icon for pinned questions */}
                        {question.title}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1.5">
                        {community && (
                             <Badge variant="community" className="py-0.5 px-1.5">
                                {community.icon && <community.icon className="mr-1 h-3 w-3"/>}
                                {community.name}
                             </Badge>
                        )}
                        {question.tags.slice(0, 2).map(tag => (
                          <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                            <Badge variant="secondary" className="py-0.5 px-1.5 hover:bg-primary/20 transition-colors cursor-pointer">
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {question.content.substring(0, 100)}{question.content.length > 100 ? '...' : ''}
                    </p>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-foreground tabular-nums">{question.upvotes || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle text-sm text-foreground tabular-nums">{question.replyCount || 0}</TableCell>
                  <TableCell className="text-center align-middle text-sm text-foreground tabular-nums">
                    {Intl.NumberFormat('en', { notation: 'compact' }).format(question.views || 0)}
                  </TableCell>
                  <TableCell className="text-right align-middle text-xs text-muted-foreground">
                     <div className="flex items-center justify-end gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={question.author.photoURL || undefined} alt={question.author.displayName || 'Author'} />
                          <AvatarFallback className="text-xs">
                            {question.author.displayName ? question.author.displayName.charAt(0).toUpperCase() : <UserCircle size={12} />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <div className="font-medium text-foreground">{question.author.displayName || 'Anonymous'}</div>
                          <div>{formatDistanceToNow(new Date(question.lastActivityAt || question.createdAt), { addSuffix: true })}</div>
                        </div>
                     </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-16 bg-card/80 backdrop-blur-md rounded-lg shadow-sm mt-8 border border-white/10">
          <HelpCircle className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Questions Found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {searchTerm || tagFilter || communityFilter 
              ? "It seems there are no questions matching your current search or filter criteria. Try broadening your search!" 
              : "There are currently no questions in the forum. Why not be the first to ask one?"}
          </p>
          {!(searchTerm || tagFilter || communityFilter) && (
            user ? (
              <Button asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/qna/ask">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ask Your First Question
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="mt-8">
                <Link href="/auth">
                  <PlusCircle className="mr-2 h-4 w-4" /> Sign In to Ask Questions
                </Link>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
