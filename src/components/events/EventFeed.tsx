"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarDays, Search } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import EventCard from "@/components/events/EventCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getEvents } from "@/lib/services/eventService"
import type { Event } from "@/lib/types"

export default function EventFeed() {
  const params = useSearchParams()
  const community = params.get("community")
  const [events, setEvents] = useState<Event[] | null>(null)
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming")
  const [query, setQuery] = useState(params.get("search") ?? "")

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
  }, [])

  const shown = useMemo(() => {
    const now = Date.now()
    const q = query.trim().toLowerCase()
    return (events ?? [])
      .filter((e) =>
        when === "upcoming"
          ? new Date(e.dateTime).getTime() >= now
          : new Date(e.dateTime).getTime() < now
      )
      .filter((e) => !community || e.communityId === community)
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.clubName.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        when === "upcoming"
          ? a.dateTime.localeCompare(b.dateTime)
          : b.dateTime.localeCompare(a.dateTime)
      )
  }, [events, when, community, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Filter events"
            placeholder="Filter by title or club"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div
          role="group"
          aria-label="When"
          className="flex rounded-md border p-0.5"
        >
          {(["upcoming", "past"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={when === value ? "secondary" : "ghost"}
              aria-pressed={when === value}
              onClick={() => setWhen(value)}
              className="h-8 capitalize"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {!events ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={query ? "No events match" : `No ${when} events`}
        >
          {when === "upcoming"
            ? "Check back soon, or look at past events."
            : undefined}
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  )
}
