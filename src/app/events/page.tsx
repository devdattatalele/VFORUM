import EventFeed from '@/components/events/EventFeed';

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 font-headline">Upcoming Events</h1>
      <EventFeed />
    </div>
  );
}
