"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Search, SearchX } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import PageHeader, { SectionHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { searchAll, type SearchResult } from "@/lib/services/searchService"

const GROUPS: { type: SearchResult["type"]; title: string }[] = [
  { type: "question", title: "Questions" },
  { type: "event", title: "Events" },
  { type: "community", title: "Communities" },
]

function Results() {
  const router = useRouter()
  const params = useSearchParams()
  const query = params.get("q") ?? ""
  const [draft, setDraft] = useState(query)
  const [results, setResults] = useState<SearchResult[] | null>(null)

  useEffect(() => {
    setDraft(query)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setResults(null)
    searchAll(query, { maxResults: 30 })
      .then(setResults)
      .catch(() => setResults([]))
  }, [query])

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (draft.trim())
            router.push(`/search?q=${encodeURIComponent(draft.trim())}`)
        }}
        className="mb-8 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search"
            placeholder="Search questions, events and communities"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {query.trim().length < 2 ? (
        <EmptyState icon={Search} title="Search vforum">
          Type at least two characters to search questions, events and
          communities.
        </EmptyState>
      ) : results === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={SearchX} title={`No results for "${query}"`}>
          Try fewer or different words.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {GROUPS.map(({ type, title }) => {
            const group = results.filter((r) => r.type === type)
            if (group.length === 0) return null
            return (
              <section key={type}>
                <SectionHeader title={title} meta={group.length} />
                <ul className="divide-y">
                  {group.map((r) => (
                    <li key={r.id} className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={r.url}
                          className="font-medium hover:underline"
                        >
                          {r.title}
                        </Link>
                        {r.community && (
                          <Badge variant="community">{r.community}</Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {r.content}
                      </p>
                      {type === "question" && r.metadata && (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {r.metadata.replyCount ?? 0} answers ·{" "}
                          {r.metadata.upvotes ?? 0} upvotes
                          {r.metadata.createdAt &&
                            ` · ${formatDistanceToNow(new Date(r.metadata.createdAt), { addSuffix: true })}`}
                        </p>
                      )}
                      {type === "event" && r.metadata?.clubName && (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {r.metadata.clubName}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Search" />
      <Suspense>
        <Results />
      </Suspense>
    </div>
  )
}
