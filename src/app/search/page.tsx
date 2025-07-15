"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAll, type SearchResult } from '@/lib/services/searchService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Calendar, Users, ArrowRight, Loader2, SearchX } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchAll(query, { maxResults: 30 });
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'community':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Search className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'event':
        return 'Event';
      case 'community':
        return 'Community';
      default:
        return 'Result';
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Search VForums</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Use the search bar above to find questions, events, and communities.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="text-lg">Searching for "{query}"...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">No results found</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We couldn't find anything matching "{query}". Try different keywords or check your spelling.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" asChild>
            <Link href="/qna">Browse Questions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Search Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>
      </div>

      {/* Questions */}
      {groupedResults.question && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Questions ({groupedResults.question.length})
            </h2>
            {groupedResults.question.length > 3 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/qna?search=${encodeURIComponent(query)}`}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {groupedResults.question.slice(0, 6).map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={result.url}>
                        <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
                          {result.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>by {result.metadata?.author}</span>
                        <span>•</span>
                        <span>{result.metadata?.upvotes || 0} upvotes</span>
                        <span>•</span>
                        <span>{result.metadata?.replyCount || 0} answers</span>
                      </div>
                    </div>
                    {result.community && (
                      <Badge variant="community" className="flex-shrink-0">
                        {result.community}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2">
                    {result.content}
                  </CardDescription>
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {result.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.tags.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      {groupedResults.event && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Events ({groupedResults.event.length})
            </h2>
            {groupedResults.event.length > 3 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/events?search=${encodeURIComponent(query)}`}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {groupedResults.event.slice(0, 4).map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={result.url}>
                        <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
                          {result.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>by {result.metadata?.clubName}</span>
                        <span>•</span>
                        <span>{result.metadata?.rsvpCount || 0} attendees</span>
                        {result.metadata?.dateTime && (
                          <>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(result.metadata.dateTime), { addSuffix: true })}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {result.community && (
                      <Badge variant="community" className="flex-shrink-0">
                        {result.community}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-2">
                    {result.content}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Communities */}
      {groupedResults.community && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Communities ({groupedResults.community.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {groupedResults.community.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Link href={result.url}>
                    <CardTitle className="text-lg hover:text-primary transition-colors flex items-center gap-2">
                      {result.metadata?.icon && <result.metadata.icon className="h-5 w-5" />}
                      {result.title}
                    </CardTitle>
                  </Link>
                </CardHeader>
                <CardContent>
                  <CardDescription>{result.content}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
} 