"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tag, TrendingUp, Hash, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TagInfo {
  name: string;
  count: number;
  trending?: boolean;
}

interface TagsSidebarProps {
  className?: string;
}

// Mock data - in real app, this would come from your database
const popularTags: TagInfo[] = [
  { name: 'javascript', count: 245, trending: true },
  { name: 'react', count: 189, trending: true },
  { name: 'python', count: 167, trending: false },
  { name: 'nodejs', count: 134, trending: true },
  { name: 'typescript', count: 123, trending: false },
  { name: 'css', count: 98, trending: false },
  { name: 'html', count: 87, trending: false },
  { name: 'database', count: 76, trending: false },
  { name: 'api', count: 65, trending: true },
  { name: 'firebase', count: 54, trending: false },
  { name: 'nextjs', count: 43, trending: true },
  { name: 'mongodb', count: 38, trending: false },
  { name: 'express', count: 32, trending: false },
  { name: 'git', count: 29, trending: false },
  { name: 'docker', count: 26, trending: false },
];

export default function TagsSidebar({ className }: TagsSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const displayedTags = showAll ? popularTags : popularTags.slice(0, 8);
  const trendingTags = popularTags.filter(tag => tag.trending).slice(0, 5);

  const handleTagClick = (tagName: string) => {
    router.push(`/qna?tag=${encodeURIComponent(tagName)}`);
  };

  const getTagColor = (count: number, trending: boolean) => {
    if (trending) return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:border-orange-800';
    if (count > 150) return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:border-blue-800';
    if (count > 100) return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 dark:border-green-800';
    if (count > 50) return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30 dark:border-purple-800';
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trending Tags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          Trending Tags
        </div>
        <div className="space-y-2">
          {trendingTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                "hover:bg-muted/50 text-left"
              )}
            >
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-orange-500" />
                <span className="text-sm font-medium">{tag.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {tag.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* All Popular Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            Popular Tags
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs h-6 px-2"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {displayedTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors",
                getTagColor(tag.count, tag.trending)
              )}
            >
              {tag.name}
              <span className="text-xs opacity-70">
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tag Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="h-4 w-4 text-muted-foreground" />
          Find by Tag
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Click on any tag to filter questions by topic. This helps you find questions in your area of expertise or interest.
        </p>
        <Link href="/qna" className="block">
          <Button variant="outline" size="sm" className="w-full text-sm">
            Browse All Questions
          </Button>
        </Link>
      </div>
    </div>
  );
} 