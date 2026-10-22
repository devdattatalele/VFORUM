"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import EventForm from "@/components/events/EventForm"
import PageHeader from "@/components/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import RequirePermission from "@/components/workspace/RequirePermission"
import { getEventById } from "@/lib/services/eventService"
import type { Event } from "@/lib/types"

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null | undefined>(undefined)

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
  }, [id])

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Edit event"
        description="Change the details or swap the poster. Moderators and admins can edit events."
      />
      <RequirePermission permission="manage_events">
        {event === undefined ? (
          <Skeleton className="h-96 w-full" />
        ) : event === null ? (
          <p className="text-muted-foreground">Event not found.</p>
        ) : (
          <EventForm event={event} />
        )}
      </RequirePermission>
    </div>
  )
}
