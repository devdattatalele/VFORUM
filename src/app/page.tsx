"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Calendar, MessageSquare, ArrowRight, Clock, Users, Eye, ArrowUp, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getEvents } from '@/lib/services/eventService';
import { getQuestions } from '@/lib/services/questionService';
import { COMMUNITIES } from '@/lib/constants';
import type { Event, Question } from '@/lib/types';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentForums, setRecentForums] = useState<Question[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
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

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Loading VForums And Events...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline text-foreground">
            {user ? `Welcome back, ${user.displayName?.split(' ')[0] || 'VITian'}! 👋` : 'Welcome to VForums And Events! 🚀'}
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            {user ? 'Stay updated with the latest events and discussions' : 'Discover events, join discussions, and connect with the VIT tech community'}
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

      {/* Feature highlights for non-authenticated users */}
      {!user && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Join the VIT Tech Community</h2>
                <p className="text-muted-foreground">Sign in to participate in discussions, create events, and connect with fellow students.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Connect with Students
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Ask Questions
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Create Events
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/auth">
                    Sign In / Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {user && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/events/create">
                    Create Your First Event
                  </Link>
                </Button>
              )}
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
            <Table className="mt-0">
              <TableHeader>
                <TableRow className="border-b-border hover:bg-transparent">
                  <TableHead className="w-[50%] text-muted-foreground font-semibold">Topic</TableHead>
                  <TableHead className="text-center text-muted-foreground font-semibold">Upvotes</TableHead>
                  <TableHead className="text-center text-muted-foreground font-semibold">Replies</TableHead>
                  <TableHead className="text-center text-muted-foreground font-semibold">Views</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentForums.map(forum => {
                  const community = COMMUNITIES.find(c => c.id === forum.communityId);
   return (
                    <TableRow key={forum.id} className="border-b-border hover:bg-muted/30 dark:hover:bg-muted/10">
                      <TableCell className="py-3 align-top">
                        <Link href={`/qna/${forum.id}`} className="block group">
                          <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
                            {forum.title}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1.5">
                            {community && (
                                 <Badge variant="outline" className="py-0.5 px-1.5 border-community-tag text-community-tag bg-google-green/10 dark:bg-google-green/20">
                                    {community.icon && <community.icon className="mr-1 h-3 w-3"/>}
                                    {community.name}
                                 </Badge>
                            )}
                            {forum.tags.slice(0, 2).map(tag => (
                              <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                                <Badge variant="secondary" className="py-0.5 px-1.5 hover:bg-primary/20 transition-colors cursor-pointer">
                                  {tag}
                                </Badge>
                              </Link>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {forum.content.substring(0, 100)}{forum.content.length > 100 ? '...' : ''}
                        </p>
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-foreground tabular-nums">{forum.upvotes || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-middle text-sm text-foreground tabular-nums">{forum.replyCount || 0}</TableCell>
                      <TableCell className="text-center align-middle text-sm text-foreground tabular-nums">
                        {Intl.NumberFormat('en', { notation: 'compact' }).format(forum.views || 0)}
                      </TableCell>
                      <TableCell className="text-right align-middle text-xs text-muted-foreground">
                         <div className="flex items-center justify-end gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={forum.author.photoURL || undefined} alt={forum.author.displayName || 'Author'} />
                              <AvatarFallback className="text-xs">
                                {forum.author.displayName ? forum.author.displayName.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-right">
                              <div className="font-medium text-foreground">{forum.author.displayName || 'Anonymous'}</div>
                              <div>{formatDistanceToNow(new Date(forum.lastActivityAt || forum.createdAt), { addSuffix: true })}</div>
                            </div>
                         </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No recent discussions found</p>
              {user && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/qna/ask">
                    Ask Your First Question
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    );
}
