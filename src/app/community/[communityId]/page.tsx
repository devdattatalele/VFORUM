"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { COMMUNITIES } from "@/lib/constants"
import type { Community, Event, Question } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Rss,
  MessageSquareQuote,
  CalendarDays,
} from "lucide-react"
import Link from "next/link"
import EventCard from "@/components/events/EventCard"
import QuestionCard from "@/components/qna/QuestionCard"
import React, { useEffect, useState } from "react"
import { getEventsByCommunity } from "@/lib/services/eventService"
import { getQuestionsByCommunity } from "@/lib/services/questionService"

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const communityId = params.communityId as string

  const [community, setCommunity] = useState<Community | null | undefined>(
    undefined
  )
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (communityId) {
      setIsLoading(true)
      setError(null)
      const foundCommunity = COMMUNITIES.find((c) => c.id === communityId)
      setCommunity(foundCommunity || null)

      if (foundCommunity) {
        // Special case for 'all' communities - fetch all data
        if (communityId === "all") {
          Promise.all([
            getEventsByCommunity(""), // Empty string gets all events
            getQuestionsByCommunity(""), // Empty string gets all questions
          ])
            .then(([events, questions]) => {
              setRelatedEvents(events.slice(0, 6)) // Show more for overview
              setRelatedQuestions(questions.slice(0, 6)) // Show more for overview
            })
            .catch((err) => {
              console.error(`Error fetching all community data:`, err)
              setError("Could not load community overview. Please try again.")
              setRelatedEvents([])
              setRelatedQuestions([])
            })
            .finally(() => {
              setIsLoading(false)
            })
        } else {
          Promise.all([
            getEventsByCommunity(communityId),
            getQuestionsByCommunity(communityId),
          ])
            .then(([events, questions]) => {
              setRelatedEvents(events.slice(0, 3)) // Show max 3 for brevity
              setRelatedQuestions(questions.slice(0, 3)) // Show max 3 for brevity
            })
            .catch((err) => {
              console.error(
                `Error fetching data for community ${communityId}:`,
                err
              )
              setError("Could not load community details. Please try again.")
              setRelatedEvents([])
              setRelatedQuestions([])
            })
            .finally(() => {
              setIsLoading(false)
            })
        }
      } else {
        setRelatedEvents([])
        setRelatedQuestions([])
        setIsLoading(false) // No community found, stop loading
      }
    }
  }, [communityId])

  if (isLoading || community === undefined) {
    // Combined loading state
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3">Loading community hub...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-4 text-3xl font-bold">Error</h1>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="mx-auto max-w-3xl py-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-4 text-3xl font-bold">Community Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The community hub you are looking for does not exist.
        </p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    )
  }

  // Special rendering for "All Communities" overview
  if (community.id === "all") {
    return (
      <div className="container mx-auto space-y-10 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="glass-card p-8 text-center">
          <CardHeader>
            <div className="mb-6 flex justify-center">
              {community.icon && (
                <community.icon className="h-20 w-20 text-primary" />
              )}
            </div>
            <CardTitle className="font-headline text-4xl">
              {community.name}
            </CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
              {community.description}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* All Communities Grid */}
        <section>
          <h2 className="mb-6 text-3xl font-semibold">Browse Communities</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {COMMUNITIES.filter((c) => c.id !== "all").map((comm) => (
              <Card
                key={comm.id}
                className="group cursor-pointer transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    {comm.icon && (
                      <comm.icon className="h-8 w-8 text-primary" />
                    )}
                    <h3 className="text-lg font-semibold">{comm.name}</h3>
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {comm.description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <Link href={`/community/${comm.id}`}>
                      Explore Community
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Activity Overview */}
        {relatedEvents.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-3xl font-semibold">
                <CalendarDays className="mr-3 h-7 w-7 text-primary" />
                Latest Events
              </h2>
              <Button variant="outline" asChild>
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {relatedQuestions.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-3xl font-semibold">
                <MessageSquareQuote className="mr-3 h-7 w-7 text-primary" />
                Recent Discussions
              </h2>
              <Button variant="outline" asChild>
                <Link href="/qna">View All Discussions</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {relatedQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-10 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="glass-card p-8 text-center">
        <CardHeader>
          <div className="mb-6 flex justify-center">
            {community.icon ? (
              <community.icon className="h-20 w-20 text-primary" />
            ) : (
              <Rss className="h-20 w-20 text-primary" />
            )}
          </div>
          <CardTitle className="font-headline text-4xl">
            {community.name}
          </CardTitle>
          {community.description && (
            <CardDescription className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
              {community.description ||
                `Welcome to the ${community.name} hub! Find events, ask questions, and connect with members.`}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center text-3xl font-semibold">
              <CalendarDays className="mr-3 h-7 w-7 text-primary" />
              Recent Events
            </h2>
            <Button variant="outline" asChild>
              <Link href={`/events?community=${community.id}`}>
                View All Events
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Related Questions Section */}
      {relatedQuestions.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center text-3xl font-semibold">
              <MessageSquareQuote className="mr-3 h-7 w-7 text-primary" />
              Recent Questions
            </h2>
            <Button variant="outline" asChild>
              <Link href={`/qna?community=${community.id}`}>
                View All Questions
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {relatedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>
      )}

      {relatedEvents.length === 0 &&
        relatedQuestions.length === 0 &&
        !isLoading &&
        !error && (
          <Card className="glass-card py-12 text-center">
            <CardContent>
              <Rss className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-2xl font-semibold text-foreground">
                It&apos;s a bit quiet here...
              </h3>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                No recent activity found for {community.name}. Check back later
                or explore other communities!
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
