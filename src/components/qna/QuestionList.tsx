
"use client";

import type { Question } from '@/lib/types';
import QuestionCard from './QuestionCard';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle, Search, HelpCircle, Loader2 } from 'lucide-react'; 
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from 'react';
import { getQuestions } from '@/lib/services/questionService';

export default function QuestionList() {
  const searchParams = useSearchParams();
  const communityFilter = searchParams.get('community');
  const tagFilter = searchParams.get('tag');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); 
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
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'popular') {
        return (b.upvotes - (b.downvotes || 0)) - (a.upvotes - (a.downvotes || 0));
      }
      // Placeholder for 'unanswered' - requires actual answer data
      if (sortBy === 'unanswered') {
        return (a.upvotes - (a.downvotes || 0)) - (b.upvotes - (b.downvotes || 0));
      }
      return 0;
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-lg glass-card sticky top-[calc(var(--header-height,64px)+1rem)] z-30">
        <div className="relative w-full sm:max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
            placeholder="Search questions by keyword or tag..." 
            className="pl-10 bg-background/70 focus:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
       
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/70 focus:bg-background">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="unanswered">Less Activity</SelectItem>
            </SelectContent>
          </Select>
           <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/qna/ask">
              <PlusCircle className="mr-2 h-4 w-4" /> Ask Question
            </Link>
          </Button>
        </div>
      </div>

      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/80 backdrop-blur-md rounded-lg shadow-sm mt-8 border border-white/10">
           <HelpCircle className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Questions Found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {searchTerm || communityFilter || tagFilter 
              ? "No questions match your current search or filters. Try a different query!" 
              : "It's quiet in here... Be the first to spark a discussion by asking a question!"}
          </p>
          {!(searchTerm || communityFilter || tagFilter) && (
            <Button asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/qna/ask">
                <PlusCircle className="mr-2 h-4 w-4" /> Ask a Question
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
