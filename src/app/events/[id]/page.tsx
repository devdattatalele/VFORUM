
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { Event } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Info, ArrowLeft, Loader2, AlertTriangle, MapPin } from "lucide-react";
import { format } from "date-fns";
import { COMMUNITIES } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { getEventById } from "@/lib/services/eventService"; // Import the service

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null | undefined>(undefined); // undefined for loading
  const [isRsvpd, setIsRsvpd] = useState(false); // Placeholder
  const [rsvpCount, setRsvpCount] = useState(0); // Placeholder
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      setError(null);
      getEventById(eventId)
        .then((fetchedEvent) => {
          if (fetchedEvent) {
            setEvent(fetchedEvent);
            setRsvpCount(fetchedEvent.rsvpCount || 0);
            // TODO: Check if user has RSVPd from user data or local storage
          } else {
            setEvent(null); // Not found
          }
        })
        .catch(err => {
          console.error("Error fetching event:", err);
          setError("Could not load the event details.");
          setEvent(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [eventId]);

  const handleRsvp = () => {
    if (!event) return;
    // TODO: Implement actual RSVP logic with Firebase
    setIsRsvpd(!isRsvpd);
    setRsvpCount(prev => isRsvpd ? prev - 1 : prev + 1);
    console.log(`RSVP status for event ${event.id}: ${!isRsvpd}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Error Loading Event</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  const community = COMMUNITIES.find(c => c.id === event.communityId);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="overflow-hidden shadow-lg glass-card">
        <CardHeader className="p-0 relative">
          <Image
            src={event.posterImageUrl || `https://placehold.co/800x400.png?text=${encodeURIComponent(event.title)}`}
            alt={event.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover"
            data-ai-hint="event poster detailed"
          />
          {community && (
            <Badge variant="secondary" className="absolute top-4 right-4 text-sm py-1 px-3">
              {community.icon && <community.icon className="mr-2 h-4 w-4" />}
              {community.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="text-3xl font-headline mb-3">{event.title}</CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 text-muted-foreground">
            <div className="flex items-center">
              <CalendarDays className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{format(new Date(event.dateTime), "EEEE, MMMM d, yyyy")}</p>
                <p className="text-sm">{format(new Date(event.dateTime), "h:mm a")}</p>
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

          <CardDescription className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </CardDescription>

        </CardContent>
        <CardFooter className="p-6 flex flex-col sm:flex-row justify-between items-center border-t">
          <div className="flex items-center text-lg text-muted-foreground mb-4 sm:mb-0">
            <Users className="mr-2 h-6 w-6 text-primary" />
            <span className="font-medium text-foreground">{rsvpCount}</span>
            <span className="ml-1">Going</span>
          </div>
          <Button 
            onClick={handleRsvp} 
            variant={isRsvpd ? "secondary" : "default"}
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isRsvpd ? 'Cancel RSVP' : 'RSVP Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
