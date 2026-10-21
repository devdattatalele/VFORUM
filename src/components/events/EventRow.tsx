import Link from "next/link"
import { format } from "date-fns"
import { COMMUNITIES } from "@/lib/constants"
import type { Event } from "@/lib/types"
import { cn } from "@/lib/utils"

// Date tile and title, like vboard's event cards.
export default function EventRow({
  event,
  className,
}: {
  event: Event
  className?: string
}) {
  const date = new Date(event.dateTime)
  const community = COMMUNITIES.find((c) => c.id === event.communityId)
  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent",
        className
      )}
    >
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-secondary">
        <span className="font-mono text-[11px] uppercase text-brand">
          {format(date, "MMM")}
        </span>
        <span className="text-xl font-semibold leading-none">
          {format(date, "d")}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{event.title}</p>
        <p className="text-sm text-muted-foreground">
          {format(date, "EEE, d MMM · h:mm a")}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {event.clubName}
          {community ? ` · ${community.name}` : ""}
        </p>
      </div>
    </Link>
  )
}
