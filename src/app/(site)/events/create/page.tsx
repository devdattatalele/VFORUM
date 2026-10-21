"use client"

import EventForm from "@/components/events/EventForm"
import PageHeader from "@/components/PageHeader"
import RequirePermission from "@/components/workspace/RequirePermission"

export default function CreateEventPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Create event"
        description="Post a workshop, talk or hackathon. Moderators and admins can create events."
      />
      <RequirePermission permission="create_events">
        <EventForm />
      </RequirePermission>
    </div>
  )
}
