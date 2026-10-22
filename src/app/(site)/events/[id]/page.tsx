"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, ArrowUpRight, CalendarDays, Pencil } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { COMMUNITIES } from "@/lib/constants"
import { getEventById } from "@/lib/services/eventService"
import type { Event } from "@/lib/types"
import { safeHttpUrl } from "@/lib/urls"
import { hasPermission } from "@/lib/utils/userUtils"

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null | undefined>(undefined)

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
  }, [id])

  if (event === undefined) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="aspect-[2/1] w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  if (event === null) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Event not found"
        action={
          <Button asChild variant="outline">
            <Link href="/events">All events</Link>
          </Button>
        }
      >
        It may have been removed, or the link is wrong.
      </EmptyState>
    )
  }

  const date = new Date(event.dateTime)
  const community = COMMUNITIES.find((c) => c.id === event.communityId)
  const rsvp = safeHttpUrl(event.rsvpLink)
  const past = date.getTime() < Date.now()
  const facts = [
    { label: "Date", value: format(date, "EEEE, d MMMM yyyy") },
    { label: "Time", value: format(date, "h:mm a") },
    { label: "Hosted by", value: event.clubName },
    { label: "Community", value: community?.name ?? "General" },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Events
        </Link>
        {hasPermission(user, "manage_events") && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${event.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </Button>
        )}
      </div>
      <Image
        src={
          safeHttpUrl(event.posterImageUrl) ??
          `https://placehold.co/800x400.png?text=${encodeURIComponent(event.title)}`
        }
        alt=""
        width={800}
        height={400}
        unoptimized
        className="aspect-[2/1] w-full rounded-lg border object-cover"
      />
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-wider text-brand">
          {past ? "Past event" : "Upcoming event"}
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {event.title}
        </h1>
      </header>

      <dl className="grid grid-cols-2 border-t sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="border-b py-4 pr-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {f.label}
            </dt>
            <dd className="mt-1 text-sm font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>

      <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>

      {rsvp && !past && (
        <Button asChild size="lg">
          <a href={rsvp} target="_blank" rel="noopener noreferrer">
            RSVP with the club <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  )
}
