
"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { COMMUNITIES } from "@/lib/constants";
import type { Community, Event, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertTriangle, Rss, MessageSquareQuote, CalendarDays } from "lucide-react";
import Link from "next/link";
import EventCard from "@/components/events/EventCard";
import QuestionCard from "@/components/qna/QuestionCard";
import React, { useEffect, useState } from "react";
import { getEventsByCommunity } from "@/lib/services/eventService";
import { getQuestionsByCommunity } from "@/lib/services/questionService";

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;

  const [community, setCommunity] = useState<Community | null | undefined>(undefined);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (communityId) {
      setIsLoading(true);
      setError(null);
      const foundCommunity = COMMUNITIES.find(c => c.id === communityId && c.id !== 'all');
      setCommunity(foundCommunity || null);

      if (foundCommunity) {
        Promise.all([
          getEventsByCommunity(communityId),
          getQuestionsByCommunity(communityId)
        ]).then(([events, questions]) => {
          setRelatedEvents(events.slice(0,3)); // Show max 3 for brevity
          setRelatedQuestions(questions.slice(0,3)); // Show max 3 for brevity
        }).catch(err => {
          console.error(`Error fetching data for community ${communityId}:`, err);
          setError("Could not load community details. Please try again.");
          setRelatedEvents([]);
          setRelatedQuestions([]);
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        setRelatedEvents([]);
        setRelatedQuestions([]);
        setIsLoading(false); // No community found, stop loading
      }
    }
  }, [communityId]);

  if (isLoading || community === undefined) { // Combined loading state
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3">Loading community hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Community Not Found</h1>
        <p className="text-muted-foreground mb-6">The community hub you are looking for does not exist.</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-10">
      <Button variant="outline" onClick={() => router.back()} className="mb-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="text-center glass-card p-8">
        <CardHeader>
          <div className="flex justify-center mb-6">
            {community.icon ? (
              <community.icon className="h-20 w-20 text-primary" />
            ) : (
              <Rss className="h-20 w-20 text-primary" />
            )}
          </div>
          <CardTitle className="text-4xl font-headline">{community.name}</CardTitle>
          {community.description && (
            <CardDescription className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              {community.description || `Welcome to the ${community.name} hub! Find events, ask questions, and connect with members.`}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold flex items-center">
              <CalendarDays className="mr-3 h-7 w-7 text-primary" />
              Recent Events
            </h2>
            <Button variant="outline" asChild>
              <Link href={`/events?community=${community.id}`}>View All Events</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Related Questions Section */}
      {relatedQuestions.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold flex items-center">
              <MessageSquareQuote className="mr-3 h-7 w-7 text-primary" />
              Recent Questions
            </h2>
            <Button variant="outline" asChild>
              <Link href={`/qna?community=${community.id}`}>View All Questions</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {relatedQuestions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>
      )}

      {(relatedEvents.length === 0 && relatedQuestions.length === 0 && !isLoading && !error) && (
         <Card className="py-12 text-center glass-card">
            <CardContent>
              <Rss className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">It's a bit quiet here...</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                No recent activity found for {community.name}. Check back later or explore other communities!
              </p>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
