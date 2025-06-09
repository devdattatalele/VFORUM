import { Suspense } from 'react';
import EventFeed from '@/components/events/EventFeed';
import { Loader2 } from 'lucide-react';

function EventFeedSkeleton() {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading events...</p>
    </div>
  );
}

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 font-headline">Upcoming Events</h1>
      <Suspense fallback={<EventFeedSkeleton />}>
        <EventFeed />
      </Suspense>
    </div>
  );
}
