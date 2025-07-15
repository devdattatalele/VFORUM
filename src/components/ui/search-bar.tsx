"use client";

import * as React from "react";
import { Search, X, MessageSquare, Calendar, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quickSearch, type SearchResult } from "@/lib/services/searchService";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ 
  placeholder = "Search forums, events, communities...", 
  onSearch,
  className 
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Search when debounced query changes
  React.useEffect(() => {
    async function performQuickSearch() {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await quickSearch(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Quick search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performQuickSearch();
  }, [debouncedQuery]);

  // Handle clicks outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    if (onSearch) {
      onSearch("");
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'community':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const shouldShowDropdown = isFocused && (results.length > 0 || isLoading || (query.length >= 2 && !isLoading));

  return (
    <div ref={searchRef} className={cn("relative flex-1 max-w-lg", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className={cn(
              "h-9 pl-9 pr-9 border border-border bg-background",
              "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
              "transition-all duration-200"
            )}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          
          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
          
          {!isLoading && results.length > 0 && (
            <>
              <div className="p-3 space-y-2">
                {results.slice(0, 6).map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    onClick={() => setIsFocused(false)}
                    className="block p-3 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {result.title}
                          </h4>
                          {result.community && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {result.community}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {query.trim() && (
                <div className="border-t border-border p-3">
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View all results for "{query}"
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 