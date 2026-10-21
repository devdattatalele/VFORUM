import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowUpRight } from "lucide-react"
import { COMMUNITIES } from "@/lib/constants"
import type { Event } from "@/lib/types"
import { safeHttpUrl } from "@/lib/urls"

export default function EventCard({ event }: { event: Event }) {
  const date = new Date(event.dateTime)
  const community = COMMUNITIES.find((c) => c.id === event.communityId)
  const rsvp = safeHttpUrl(event.rsvpLink)

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-card">
      {/* Posters are any https image an organizer links, so they skip the
          optimizer, which only accepts the hosts listed in next.config. */}
      <Image
        src={
          safeHttpUrl(event.posterImageUrl) ??
          "https://placehold.co/600x300.png"
        }
        alt=""
        width={600}
        height={300}
        unoptimized
        className="aspect-[2/1] w-full border-b object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-xs uppercase text-brand">
            {format(date, "EEE d MMM")}
          </span>{" "}
          · {format(date, "h:mm a")}
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/events/${event.id}`}
            className="hover:underline hover:underline-offset-4"
          >
            {event.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-sm">
        <span className="truncate text-muted-foreground">
          {event.clubName}
          {community ? ` · ${community.name}` : ""}
        </span>
        {rsvp ? (
          <a
            href={rsvp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 font-medium hover:underline"
          >
            RSVP <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : (
          <Link
            href={`/events/${event.id}`}
            className="shrink-0 font-medium hover:underline"
          >
            Details
          </Link>
        )}
      </div>
    </article>
  )
}
