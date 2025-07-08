"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Calendar, MessageSquare, ArrowRight, Clock, Users, Eye, ArrowUp, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SkeletonCard } from '@/components/ui/skeleton';
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
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg text-foreground">Loading VForums And Events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Section */}
      <Card variant="outlined" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle size="lg" className="text-blue-900 dark:text-blue-100">
                    Welcome to VForums And Events
                  </CardTitle>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Your unified platform for campus tech communities
                  </p>
                </div>
              </div>
              
              {user ? (
                <div className="bg-white/50 dark:bg-white/10 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Welcome back, {user.displayName || 'Tech Enthusiast'}! 👋
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                    Ready to dive into today's discussions and upcoming events?
                  </p>
                </div>
              ) : (
                <div className="bg-white/50 dark:bg-white/10 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Join the community! 🚀
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                    Connect with fellow tech enthusiasts and stay updated on events.
                  </p>
                  <Button variant="primary" size="sm" asChild className="mt-3">
                    <Link href="/auth">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
            

          </div>
        </CardHeader>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Columns - Events & Forums */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle size="md" className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
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
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const community = COMMUNITIES.find(c => c.id === event.communityId);
                    return (
                      <div key={event.id} className="border border-border rounded-lg p-4 hover:shadow-md hover:border-border/80 transition-all duration-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/events/${event.id}`}>
                              <h3 className="font-semibold text-foreground hover:text-blue-500 transition-colors line-clamp-2">
                                {event.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDistanceToNow(new Date(event.dateTime), { addSuffix: true })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.rsvpCount || 0}
                              </div>
                            </div>
                          </div>
                          {community && (
                            <Badge variant="community" className="flex-shrink-0">
                              {community.icon && <community.icon className="h-3 w-3 mr-1" />}
                              {community.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle size="md" className="flex items-center gap-2">
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
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : recentForums.length > 0 ? (
                <div className="space-y-4">
                  {recentForums.map((question) => {
                    const community = COMMUNITIES.find(c => c.id === question.communityId);
                    return (
                      <div key={question.id} className="border border-border rounded-lg p-4 hover:shadow-md hover:border-border/80 transition-all duration-200">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <Link href={`/qna/${question.id}`} className="flex-1">
                              <h3 className="font-semibold text-foreground hover:text-blue-500 transition-colors line-clamp-2">
                                {question.title}
                              </h3>
                            </Link>
                            {community && (
                              <Badge variant="community" className="flex-shrink-0">
                                {community.icon && <community.icon className="h-3 w-3 mr-1" />}
                                {community.name}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {question.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={question.author.photoURL || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {question.author.displayName?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                {question.author.displayName || 'Anonymous'}
                              </div>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ArrowUp className="h-4 w-4" />
                                {question.upvotes || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {question.views || 0}
                              </div>
                            </div>
                          </div>
                          
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {question.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{question.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recent discussions</p>
                  {user && (
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/qna/ask">
                        Start a Discussion
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle size="md" className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" asChild className="w-full justify-start border border-border">
                <Link href="/qna/ask">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask a Question
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full justify-start border border-border">
                <Link href="/events/create">
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full justify-start border border-border">
                <Link href="/community/all">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Communities
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle size="md">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Discussions</span>
                <Badge variant="secondary">{recentForums.length}+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Upcoming Events</span>
                <Badge variant="secondary">{upcomingEvents.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Communities</span>
                <Badge variant="secondary">5</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
