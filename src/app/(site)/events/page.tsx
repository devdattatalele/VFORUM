"use client"

import { Suspense } from "react"
import Link from "next/link"
import EventFeed from "@/components/events/EventFeed"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { hasPermission } from "@/lib/utils/userUtils"

export default function EventsPage() {
  const { user } = useAuth()
  return (
    <>
      <PageHeader
        title="Events"
        description="Workshops, hackathons and talks from VIT's clubs."
        actions={
          hasPermission(user, "create_events") && (
            <Button asChild>
              <Link href="/events/create">Create event</Link>
            </Button>
          )
        }
      />
      <Suspense>
        <EventFeed />
      </Suspense>
    </>
  )
}
