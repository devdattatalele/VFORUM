"use client";

import type { Event } from '@/lib/types';
import EventCard from './EventCard';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle, CalendarX, Loader2 } from 'lucide-react'; 
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useEffect, useState } from 'react';
import { getEvents } from '@/lib/services/eventService';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/utils/userUtils';


export default function EventFeed() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const communityFilter = searchParams.get('community');
  const searchFromUrl = searchParams.get('search');
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || '');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-asc', 'date-desc', 'popularity'
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Could not load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Update search term when URL parameter changes
  useEffect(() => {
    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchFromUrl]);

  const filteredEvents = React.useMemo(() => {
    let processedEvents = events;
    if (communityFilter && communityFilter !== 'all') {
      processedEvents = processedEvents.filter(event => event.communityId === communityFilter);
    }
    if (searchTerm) {
      processedEvents = processedEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.clubName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    processedEvents = processedEvents.filter(event => new Date(event.dateTime) >= new Date(new Date().setDate(new Date().getDate() -1)));

    return processedEvents.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      }
      if (sortBy === 'popularity') { 
        return (b.rsvpCount || 0) - (a.rsvpCount || 0);
      }
      return 0;
    });
  }, [events, communityFilter, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <CalendarX className="mx-auto h-12 w-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-lg glass-card sticky top-[calc(var(--header-height,64px)+1rem)] z-30">
        <Input 
          placeholder="Search events..." 
          className="max-w-sm bg-background/70 focus:bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/70 focus:bg-background">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest First)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>
          {user && hasPermission(user, 'create_events') && (
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              <Link href="/events/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Event
              </Link>
            </Button>
          )}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/80 backdrop-blur-md rounded-lg shadow-sm mt-8 border border-white/10">
          <CalendarX className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Upcoming Events Found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {searchTerm || communityFilter 
              ? "It seems there are no events matching your current search or filter criteria. Try broadening your search!" 
              : "There are currently no upcoming events. Why not be the first to create one?"}
          </p>
          {!(searchTerm || communityFilter) && user && hasPermission(user, 'create_events') && (
            <Button asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/events/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
