"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CommentSearch({ 
  onSearch, 
  placeholder = "Search comments...",
  className 
}: CommentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    setIsExpanded(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  return (
    <div className={cn("relative", className)}>
      {!isExpanded ? (
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2"
          onClick={handleExpand}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 p-0 h-7 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
} 