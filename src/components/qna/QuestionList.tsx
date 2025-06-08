"use client";

import type { Question } from '@/lib/types';
import QuestionCard from './QuestionCard';
import { mockQuestions } from '@/lib/mockData'; // Using mock data for now
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from 'react';

export default function QuestionList() {
  const searchParams = useSearchParams();
  const communityFilter = searchParams.get('community');
  const tagFilter = searchParams.get('tag');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('recent'); // 'recent', 'popular', 'unanswered'

  const filteredQuestions = React.useMemo(() => {
    let questions = mockQuestions;
    if (communityFilter && communityFilter !== 'all') {
      questions = questions.filter(q => q.communityId === communityFilter);
    }
    if (tagFilter) {
      questions = questions.filter(q => q.tags.includes(tagFilter));
    }
    if (searchTerm) {
      questions = questions.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return questions.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'popular') {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      // 'unanswered' logic would require comment count, mocking for now
      if (sortBy === 'unanswered') {
        // This is a mock logic. In a real app, you'd check actual answer count.
        return (a.id === 'q3' ? -1 : 1); // Example: q3 is unanswered
      }
      return 0;
    });

  }, [communityFilter, tagFilter, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
            placeholder="Search questions by keyword or tag..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
       
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
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
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold text-muted-foreground">No questions found.</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm || communityFilter || tagFilter ? "Try adjusting your search or filters." : "Be the first to ask a question!"}
          </p>
        </div>
      )}
    </div>
  );
}
