"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { searchAll, type SearchResult } from "@/lib/services/searchService"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  MessageSquare,
  Calendar,
  Users,
  ArrowRight,
  Loader2,
  SearchX,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchAll(query, { maxResults: 30 })
        setResults(searchResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case "question":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "event":
        return <Calendar className="h-5 w-5 text-green-500" />
      case "community":
        return <Users className="h-5 w-5 text-purple-500" />
      default:
        return <Search className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "question":
        return "Question"
      case "event":
        return "Event"
      case "community":
        return "Community"
      default:
        return "Result"
    }
  }

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>
  )

  if (!query.trim()) {
    return (
      <div className="py-16 text-center">
        <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          Search VForums
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          Use the search bar above to find questions, events, and communities.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="mr-3 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg">Searching for &quot;{query}&quot;...</span>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="py-16 text-center">
        <SearchX className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          No results found
        </h2>
        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
          We couldn&apos;t find anything matching &quot;{query}&quot;. Try
          different keywords or check your spelling.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/qna">Browse Questions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Search Results
          </h1>
          <p className="mt-1 text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for
            &quot;
            {query}&quot;
          </p>
        </div>
      </div>

      {/* Questions */}
      {groupedResults.question && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Questions ({groupedResults.question.length})
            </h2>
            {groupedResults.question.length > 3 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/qna?search=${encodeURIComponent(query)}`}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {groupedResults.question.slice(0, 6).map((result) => (
              <Card
                key={result.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={result.url}>
                        <CardTitle className="line-clamp-2 text-lg transition-colors hover:text-primary">
                          {result.title}
                        </CardTitle>
                      </Link>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
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
                    <div className="mt-3 flex flex-wrap gap-1">
                      {result.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Calendar className="h-5 w-5 text-green-500" />
              Events ({groupedResults.event.length})
            </h2>
            {groupedResults.event.length > 3 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/events?search=${encodeURIComponent(query)}`}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {groupedResults.event.slice(0, 4).map((result) => (
              <Card
                key={result.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={result.url}>
                        <CardTitle className="line-clamp-2 text-lg transition-colors hover:text-primary">
                          {result.title}
                        </CardTitle>
                      </Link>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>by {result.metadata?.clubName}</span>
                        <span>•</span>
                        <span>{result.metadata?.rsvpCount || 0} attendees</span>
                        {result.metadata?.dateTime && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(
                                new Date(result.metadata.dateTime),
                                { addSuffix: true }
                              )}
                            </span>
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-purple-500" />
              Communities ({groupedResults.community.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {groupedResults.community.map((result) => (
              <Card
                key={result.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <Link href={result.url}>
                    <CardTitle className="flex items-center gap-2 text-lg transition-colors hover:text-primary">
                      {result.metadata?.icon && (
                        <result.metadata.icon className="h-5 w-5" />
                      )}
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
  )
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  )
}
