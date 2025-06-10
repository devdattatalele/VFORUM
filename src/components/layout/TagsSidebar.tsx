"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tag, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getQuestions } from '@/lib/services/questionService';

interface TagInfo {
  name: string;
  count: number;
}

interface TagsSidebarProps {
  className?: string;
}

export default function TagsSidebar({ className }: TagsSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRealTags() {
      try {
        setIsLoading(true);
        const questions = await getQuestions();
        
        // Extract and count all tags
        const tagCounts = new Map<string, number>();
        
        questions.forEach(question => {
          question.tags.forEach(tag => {
            const normalizedTag = tag.toLowerCase().trim();
            tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
          });
        });
        
        // Convert to array and sort by count
        const sortedTags = Array.from(tagCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20); // Take top 20 tags
        
        setTags(sortedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRealTags();
  }, []);

  const displayedTags = showAll ? tags : tags.slice(0, 8);

  const handleTagClick = (tagName: string) => {
    router.push(`/qna?tag=${encodeURIComponent(tagName)}`);
  };

  const getTagColor = (count: number) => {
    if (count > 10) return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:border-blue-800';
    if (count > 5) return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 dark:border-green-800';
    if (count > 2) return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30 dark:border-purple-800';
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600';
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Tag className="h-4 w-4 text-primary" />
          Search Forum by Category
        </div>
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            Search Forum by Category
          </div>
          {tags.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs h-6 px-2"
            >
              {showAll ? 'Show Less' : 'Show All'}
            </Button>
          )}
        </div>
        
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {displayedTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors",
                  getTagColor(tag.count)
                )}
              >
                {tag.name}
                <span className="text-xs opacity-70">
                  {tag.count}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-4">
            No categories found. Start asking questions to build categories!
          </div>
        )}
      </div>

      <Separator />

      {/* Browse All */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="h-4 w-4 text-muted-foreground" />
          Browse All Forums
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Click on any category above to filter questions by topic, or browse all questions and discussions.
        </p>
        <Link href="/qna" className="block">
          <Button variant="outline" size="sm" className="w-full text-sm">
            View All Questions
          </Button>
        </Link>
      </div>
    </div>
  );
} 