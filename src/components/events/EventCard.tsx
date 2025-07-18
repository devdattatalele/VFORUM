
"use client";

import Image from 'next/image';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Info, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { COMMUNITIES } from '@/lib/constants';
import React from 'react'; 

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  
  const community = COMMUNITIES.find(c => c.id === event.communityId);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full glass-card">
      <CardHeader className="p-0 relative">
        <Image
          src={event.posterImageUrl}
          alt={event.title}
          width={600}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint="event poster"
        />
        {community && (
          <Badge variant="community" className="absolute top-2 right-2">
            {community.icon && <community.icon className="mr-1 h-3 w-3" />}
            {community.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2 font-headline hover:text-primary transition-colors">
           <Link href={`/events/${event.id}`}>{event.title}</Link>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>{format(new Date(event.dateTime), "MMM d, yyyy 'at' h:mm a")}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Info className="mr-2 h-4 w-4" />
          <span>Organized by: {event.clubName}</span>
        </div>
        <CardDescription className="text-sm text-foreground line-clamp-3">
          {event.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>{event.rsvpCount || 0} Going</span>
        </div>
        {event.rsvpLink ? (
          <Button 
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
              RSVP
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        ) : (
          <Button 
            variant="outline"
            size="sm"
            disabled
            className="opacity-50"
          >
            RSVP Closed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
