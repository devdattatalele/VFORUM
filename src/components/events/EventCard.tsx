
"use client";

import Image from 'next/image';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/modern-button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/modern-card';
import { CalendarIcon, Users, ExternalLink, MapPin } from 'lucide-react';
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
    <Card variant="interactive" className="overflow-hidden flex flex-col h-full group">
      {/* Image Header */}
      <div className="relative overflow-hidden">
        <Image
          src={event.posterImageUrl}
          alt={event.title}
          width={600}
          height={300}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {community && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4 bg-white/90 text-gray-900 backdrop-blur-sm"
          >
            {community.icon && <community.icon className="mr-1 h-3 w-3" />}
            {community.name}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <Link href={`/events/${event.id}`}>
              <CardTitle className="line-clamp-2 group-hover:text-brand-primary transition-colors duration-200">
                {event.title}
              </CardTitle>
            </Link>
            <p className="text-sm text-gray-400 mt-1">by {event.clubName}</p>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-brand-primary" />
              <span>{format(new Date(event.dateTime), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t border-gray-700 justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{event.rsvpCount || 0} attending</span>
        </div>
        
        {event.rsvpLink ? (
          <Button 
            asChild
            variant="primary"
            size="sm"
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
          >
            RSVP Closed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
