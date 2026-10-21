"use client"

import Image from "next/image"
import type { Event } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CalendarDays, Users, Info, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { COMMUNITIES } from "@/lib/constants"
import React from "react"
import { safeHttpUrl } from "@/lib/urls"

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const community = COMMUNITIES.find((c) => c.id === event.communityId)
  const rsvpLink = safeHttpUrl(event.rsvpLink)

  return (
    <Card className="glass-card flex h-full flex-col overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="relative p-0">
        {/* Posters are any https image an organizer links, so they skip the
            optimizer, which only accepts the hosts listed in next.config. */}
        <Image
          src={
            safeHttpUrl(event.posterImageUrl) ??
            "https://placehold.co/600x400.png"
          }
          unoptimized
          alt={event.title}
          width={600}
          height={300}
          className="h-48 w-full object-cover"
          data-ai-hint="event poster"
        />
        {community && (
          <Badge variant="community" className="absolute right-2 top-2">
            {community.icon && <community.icon className="mr-1 h-3 w-3" />}
            {community.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 font-headline text-xl transition-colors hover:text-primary">
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </CardTitle>
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>
            {format(new Date(event.dateTime), "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        <div className="mb-3 flex items-center text-sm text-muted-foreground">
          <Info className="mr-2 h-4 w-4" />
          <span>Organized by: {event.clubName}</span>
        </div>
        <CardDescription className="line-clamp-3 text-sm text-foreground">
          {event.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>{event.rsvpCount || 0} Going</span>
        </div>
        {rsvpLink ? (
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href={rsvpLink} target="_blank" rel="noopener noreferrer">
              RSVP
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="opacity-50">
            RSVP Closed
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
