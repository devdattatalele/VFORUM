"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { MessageSquare, Search, X } from "lucide-react"
import CommunityList from "@/components/CommunityList"
import EmptyState from "@/components/EmptyState"
import { SectionHeader } from "@/components/PageHeader"
import QuestionRow from "@/components/qna/QuestionRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { COMMUNITIES } from "@/lib/constants"
import { getQuestions } from "@/lib/services/questionService"
import type { Question } from "@/lib/types"
import { cn } from "@/lib/utils"

const SORTS = {
  activity: {
    label: "Latest activity",
    by: (q: Question) => q.lastActivityAt ?? q.createdAt,
  },
  newest: { label: "Newest", by: (q: Question) => q.createdAt },
  votes: { label: "Most votes", by: (q: Question) => q.upvotes - q.downvotes },
  answers: { label: "Most answers", by: (q: Question) => q.replyCount },
  views: { label: "Most viewed", by: (q: Question) => q.views },
} as const
type Sort = keyof typeof SORTS
type Show = "all" | "unanswered" | "solved"

const PAGE = 20

// Pinned questions lead; the chosen sort applies below them.
function sortQuestions(list: Question[], sort: Sort): Question[] {
  const key = SORTS[sort].by
  return [...list].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
    const x = key(a)
    const y = key(b)
    return typeof x === "number" && typeof y === "number"
      ? y - x
      : String(y).localeCompare(String(x))
  })
}

export default function QuestionList() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const community = params.get("community")
  const tag = params.get("tag")

  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [query, setQuery] = useState(params.get("search") ?? "")
  const [show, setShow] = useState<Show>("all")
  const [sort, setSort] = useState<Sort>("activity")
  const [visible, setVisible] = useState(PAGE)

  useEffect(() => {
    getQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [])

  // Filters that belong in the URL stay shareable.
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortQuestions(
      (questions ?? []).filter(
        (item) =>
          (!community || item.communityId === community) &&
          (!tag || item.tags.includes(tag)) &&
          (show !== "unanswered" || item.replyCount === 0) &&
          (show !== "solved" || !!item.acceptedAnswerId) &&
          (!q ||
            item.title.toLowerCase().includes(q) ||
            item.content.toLowerCase().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q)))
      ),
      sort
    )
  }, [questions, community, tag, show, query, sort])

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of questions ?? [])
      for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 16)
  }, [questions])

  const communityCounts = useMemo(
    () =>
      (questions ?? []).reduce<Record<string, number>>((acc, item) => {
        acc[item.communityId] = (acc[item.communityId] ?? 0) + 1
        return acc
      }, {}),
    [questions]
  )

  const communityName = COMMUNITIES.find((c) => c.id === community)?.name
  const filtering = !!(community || tag || query.trim() || show !== "all")

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      <section className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Filter questions"
              placeholder="Filter questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div
            role="group"
            aria-label="Show"
            className="flex rounded-md border p-0.5"
          >
            {(["all", "unanswered", "solved"] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={show === value ? "secondary" : "ghost"}
                aria-pressed={show === value}
                onClick={() => setShow(value)}
                className="h-8 capitalize"
              >
                {value}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger aria-label="Sort" className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORTS).map(([value, s]) => (
                <SelectItem key={value} value={value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(communityName || tag) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Filtered by
            {communityName && (
              <FilterChip
                label={communityName}
                onClear={() => setParam("community", null)}
              />
            )}
            {tag && (
              <FilterChip
                label={tag}
                mono
                onClear={() => setParam("tag", null)}
              />
            )}
          </div>
        )}

        <SectionHeader
          title={communityName ?? "All questions"}
          meta={
            questions &&
            `${filtered.length} ${filtered.length === 1 ? "question" : "questions"}`
          }
        />

        {!questions ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={
              filtering
                ? "No questions match these filters"
                : "No questions yet"
            }
            action={
              filtering ? (
                <Button variant="outline" asChild>
                  <Link href="/qna">Clear filters</Link>
                </Button>
              ) : undefined
            }
          >
            {filtering
              ? "Try a broader search or another community."
              : "Be the first to ask one."}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, visible).map((q) => (
              <QuestionRow key={q.id} question={q} />
            ))}
            {filtered.length > visible && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setVisible((v) => v + PAGE)}
              >
                Show more ({filtered.length - visible} left)
              </Button>
            )}
          </div>
        )}
      </section>

      <aside className="space-y-10">
        <section>
          <SectionHeader title="Popular tags" />
          {!questions ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setParam("tag", tag === name ? null : name)}
                  aria-pressed={tag === name}
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono font-normal hover:bg-accent",
                      tag === name && "border-foreground"
                    )}
                  >
                    {name}
                    <span className="text-muted-foreground">{count}</span>
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </section>
        <section>
          <SectionHeader title="Communities" />
          <CommunityList counts={questions ? communityCounts : undefined} />
        </section>
      </aside>
    </div>
  )
}

function FilterChip({
  label,
  mono,
  onClear,
}: {
  label: string
  mono?: boolean
  onClear: () => void
}) {
  return (
    <Badge variant="outline" className={cn("gap-1 pr-1", mono && "font-mono")}>
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 hover:bg-accent"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
