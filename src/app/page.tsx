"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Calendar, MessageSquare, ArrowRight, Clock, Users, Eye, ArrowUp, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/modern-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonCard, SkeletonList } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getEvents } from '@/lib/services/eventService';
import { getQuestions } from '@/lib/services/questionService';
import { COMMUNITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg text-gray-300">Loading VForums And Events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to <span className="text-blue-500">VForums & Events</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Your unified platform for campus tech communities. Connect, learn, and grow together.
          </p>
        </div>

        {/* Call to Action for Non-Users */}
        {!user && (
          <Card 
            className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20"
            hoverable
          >
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-2xl font-semibold text-white">Join the VIT Tech Community</h2>
                  <p className="text-gray-400">Sign in to participate in discussions, create events, and connect with fellow students.</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                      <Users className="h-3 w-3 mr-1" />
                      Connect with Students
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Ask Questions
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      Create Events
                    </Badge>
                  </div>
                </div>
                <Button size="lg" asChild className="whitespace-nowrap">
                  <Link href="/auth" className="flex items-center gap-2">
                    Sign In / Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Events and Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-white">Upcoming Events</h2>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events">View All</Link>
                </Button>
              </div>

              {isLoadingData ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} hoverable className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-white line-clamp-2">
                              {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="h-4 w-4" />
                              {formatDistanceToNow(new Date(event.dateTime), { addSuffix: true })}
                            </div>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {event.communityId}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            {event.rsvpCount || 0} registered
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${event.id}`}>Learn More</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Upcoming Events</h3>
                    <p className="text-gray-500 mb-4">Be the first to create an event for the community!</p>
                    {user && (
                      <Button asChild>
                        <Link href="/events/create">Create Event</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Recent Q&A */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-emerald-500" />
                  <h2 className="text-2xl font-semibold text-white">Recent Q&A</h2>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/qna">View All</Link>
                </Button>
              </div>

              {isLoadingData ? (
                <SkeletonList count={3} />
              ) : recentForums.length > 0 ? (
                <div className="space-y-4">
                  {recentForums.map((question) => (
                    <Card key={question.id} hoverable className="bg-gray-800 border-gray-700">
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={question.author.photoURL || undefined} />
                            <AvatarFallback className="bg-gray-700 text-gray-300">
                              {question.author.displayName?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <Link 
                                href={`/qna/${question.id}`}
                                className="text-white hover:text-blue-400 transition-colors"
                              >
                                <h3 className="font-medium line-clamp-2">{question.title}</h3>
                              </Link>
                              <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                                <Eye className="h-4 w-4" />
                                {question.views || 0}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                              <span>{question.author.displayName || 'Anonymous'}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {question.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <ArrowUp className="h-4 w-4" />
                                  {question.upvotes || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {question.replyCount || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No Questions Yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to ask a question!</p>
                    {user && (
                      <Button asChild>
                        <Link href="/qna/ask">Ask Question</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Platform Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Events</span>
                    <span className="font-semibold text-white">{upcomingEvents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Questions</span>
                    <span className="font-semibold text-white">{recentForums.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Communities</span>
                    <span className="font-semibold text-white">{COMMUNITIES.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {user && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/qna/ask">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ask a Question
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/events/create">
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/settings">
                        <Users className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Highlights */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {COMMUNITIES.slice(0, 5).map((community) => (
                    <Link
                      key={community.id}
                      href={`/community/${community.id}`}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      {community.icon && <community.icon className="h-5 w-5 text-gray-400" />}
                      <span className="text-gray-300 hover:text-white transition-colors">
                        {community.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
