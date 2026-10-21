"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import type { Event } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Users,
  Info,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import { COMMUNITIES } from "@/lib/constants"
import React, { useEffect, useState } from "react"
import { getEventById } from "@/lib/services/eventService" // Import the service

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null | undefined>(undefined) // undefined for loading
  const [isRsvpd, setIsRsvpd] = useState(false) // Placeholder
  const [rsvpCount, setRsvpCount] = useState(0) // Placeholder
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (eventId) {
      setIsLoading(true)
      setError(null)
      getEventById(eventId)
        .then((fetchedEvent) => {
          if (fetchedEvent) {
            setEvent(fetchedEvent)
            setRsvpCount(fetchedEvent.rsvpCount || 0)
            // TODO: Check if user has RSVPd from user data or local storage
          } else {
            setEvent(null) // Not found
          }
        })
        .catch((err) => {
          console.error("Error fetching event:", err)
          setError("Could not load the event details.")
          setEvent(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [eventId])

  const handleRsvp = () => {
    if (!event) return
    // TODO: Implement actual RSVP logic with Firebase
    setIsRsvpd(!isRsvpd)
    setRsvpCount((prev) => (isRsvpd ? prev - 1 : prev + 1))
    console.log(`RSVP status for event ${event.id}: ${!isRsvpd}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3">Loading event details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-4 text-3xl font-bold">Error Loading Event</h1>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-4 text-3xl font-bold">Event Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The event you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    )
  }

  const community = COMMUNITIES.find((c) => c.id === event.communityId)

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="glass-card overflow-hidden shadow-lg">
        <CardHeader className="relative p-0">
          <Image
            src={
              event.posterImageUrl ||
              `https://placehold.co/800x400.png?text=${encodeURIComponent(event.title)}`
            }
            alt={event.title}
            width={800}
            height={400}
            className="h-64 w-full object-cover"
            data-ai-hint="event poster detailed"
          />
          {community && (
            <Badge
              variant="secondary"
              className="absolute right-4 top-4 px-3 py-1 text-sm"
            >
              {community.icon && <community.icon className="mr-2 h-4 w-4" />}
              {community.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="mb-3 font-headline text-3xl">
            {event.title}
          </CardTitle>

          <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-4 text-muted-foreground md:grid-cols-2">
            <div className="flex items-center">
              <CalendarDays className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {format(new Date(event.dateTime), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm">
                  {format(new Date(event.dateTime), "h:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Info className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Organized by</p>
                <p className="text-sm">{event.clubName}</p>
              </div>
            </div>
            {/* Example for location if it were in the type */}
            {/* <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-sm">{event.location || "Online"}</p>
              </div>
            </div> */}
          </div>

          <CardDescription className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {event.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-between border-t p-6 sm:flex-row">
          <div className="mb-4 flex items-center text-lg text-muted-foreground sm:mb-0">
            <Users className="mr-2 h-6 w-6 text-primary" />
            <span className="font-medium text-foreground">{rsvpCount}</span>
            <span className="ml-1">Going</span>
          </div>
          <Button
            onClick={handleRsvp}
            variant={isRsvpd ? "secondary" : "default"}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            {isRsvpd ? "Cancel RSVP" : "RSVP Now"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
