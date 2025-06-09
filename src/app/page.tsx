"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Calendar, MessageSquare, ArrowRight, Clock, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getEvents } from '@/lib/services/eventService';
import { getQuestions } from '@/lib/services/questionService';
import type { Event, Question } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentForums, setRecentForums] = useState<Question[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          setIsLoadingData(true);
          const [events, questions] = await Promise.all([
            getEvents(),
            getQuestions()
          ]);
          
          // Filter upcoming events and sort by date
          const now = new Date();
          const upcoming = events
            .filter(event => new Date(event.dateTime) >= now)
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
            .slice(0, 4);
          
          // Get recent questions sorted by creation date
          const recent = questions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          
          setUpcomingEvents(upcoming);
          setRecentForums(recent);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoadingData(false);
        }
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Loading VForums And Events...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline text-foreground">
            Welcome back, {user.displayName?.split(' ')[0] || 'VITian'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Stay updated with the latest events and discussions
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-green-500" />
              Upcoming Events
            </CardTitle>
            <Link href="/events">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading events...</span>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <ScrollArea className="w-full">
              <div className="flex gap-6 pb-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="flex-shrink-0 w-80 hover:shadow-lg transition-shadow">
                    <div 
                      className="h-32 bg-cover bg-center rounded-t-lg"
                      style={{ backgroundImage: `url(${event.posterImageUrl})` }}
                    />
                    <CardContent className="p-4">
                      <Link href={`/events/${event.id}`}>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                      </Link>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{event.clubName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(event.dateTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {event.rsvpCount || 0} attending
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No upcoming events at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Forum Discussions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Recent Forum Discussions
            </CardTitle>
            <Link href="/qna">
              <Button variant="outline" size="sm">
                Browse Forums <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading discussions...</span>
            </div>
          ) : recentForums.length > 0 ? (
            <div className="space-y-4">
              {recentForums.map((forum) => (
                <div 
                  key={forum.id}
                  className="p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={forum.author.photoURL || undefined} />
                      <AvatarFallback>
                        {forum.author.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/qna/${forum.id}`} className="hover:underline">
                          <h3 className="font-semibold text-foreground line-clamp-2">
                            {forum.title}
                          </h3>
                        </Link>
                        <Badge variant="outline" className="flex-shrink-0 ml-2">
                          {forum.communityId}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {forum.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by {forum.author.displayName}</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{forum.replyCount || 0} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{forum.views || 0} views</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(forum.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex gap-1">
                          {forum.tags.slice(0, 2).map((tag) => (
                            <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                              <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors">
                                {tag}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No recent discussions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper for screen height minus header (approximate)
// You might need to adjust this or use a more robust CSS solution
// For tailwind.config.js:
// theme: { extend: { minHeight: { 'screen_minus_header': 'calc