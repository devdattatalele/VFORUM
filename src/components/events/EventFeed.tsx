"use client";

import type { Event } from '@/lib/types';
import EventCard from './EventCard';
import { mockEvents } from '@/lib/mockData'; // Using mock data for now
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from 'react';


export default function EventFeed() {
  const searchParams = useSearchParams();
  const communityFilter = searchParams.get('community');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date-desc'); // 'date-asc', 'date-desc', 'popularity'

  const filteredEvents = React.useMemo(() => {
    let events = mockEvents;
    if (communityFilter && communityFilter !== 'all') {
      events = events.filter(event => event.communityId === communityFilter);
    }
    if (searchTerm) {
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.clubName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return events.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      }
      if (sortBy === 'popularity') { // Assuming rsvpCount indicates popularity
        return (b.rsvpCount || 0) - (a.rsvpCount || 0);
      }
      return 0;
    });
  }, [communityFilter, searchTerm, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Input 
          placeholder="Search events..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest First)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/events/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold text-muted-foreground">No events found.</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm || communityFilter ? "Try adjusting your search or filters." : "No events match your current criteria, or there are no upcoming events."}
          </p>
        </div>
      )}
    </div>
  );
}
