"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, MessageSquare, Search, Users, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { quickSearch, type SearchResult } from "@/lib/services/searchService"
import { cn } from "@/lib/utils"

const ICONS = {
  question: MessageSquare,
  event: Calendar,
  community: Users,
} as const

// Header search with suggestions; Enter opens the full results page.
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const debounced = useDebounce(query, 300)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    quickSearch(debounced)
      .then((r) => !cancelled && setResults(r))
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [debounced])

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search vforum"
          placeholder="Search questions, events"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="h-9 pl-9 pr-8"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border bg-popover text-popover-foreground">
          {loading && results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No matches for &quot;{query}&quot;
            </p>
          ) : (
            <ul className="divide-y">
              {results.slice(0, 6).map((r) => {
                const Icon = ICONS[r.type]
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <Link
                      href={r.url}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-3 py-2.5 hover:bg-accent"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {r.title}
                          </span>
                          {r.community && (
                            <Badge variant="community" className="shrink-0">
                              {r.community}
                            </Badge>
                          )}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {r.content}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            onClick={() => setOpen(false)}
            className="block border-t px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            All results for &quot;{query.trim()}&quot;
          </Link>
        </div>
      )}
    </div>
  )
}
