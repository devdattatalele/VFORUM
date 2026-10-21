"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  Loader2,
  Calendar,
  MessageSquare,
  ArrowRight,
  Clock,
  Users,
  Eye,
  ArrowUp,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SkeletonCard } from "@/components/ui/skeleton"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { getEvents } from "@/lib/services/eventService"
import { getQuestions } from "@/lib/services/questionService"
import { COMMUNITIES } from "@/lib/constants"
import type { Event, Question } from "@/lib/types"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentForums, setRecentForums] = useState<Question[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingData(true)
        const [events, questions] = await Promise.all([
          getEvents(),
          getQuestions(),
        ])

        // Filter upcoming events and sort by date
        const now = new Date()
        const upcoming = events
          .filter((event) => new Date(event.dateTime) >= now)
          .sort(
            (a, b) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          )
          .slice(0, 4)

        // Get recent questions sorted by creation date
        const recent = questions
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3)

        setUpcomingEvents(upcoming)
        setRecentForums(recent)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
        <p className="text-lg text-foreground">Loading VForums And Events...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Welcome Hero Section */}
      <Card
        variant="outlined"
        className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500 p-2">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle
                    size="lg"
                    className="text-blue-900 dark:text-blue-100"
                  >
                    Welcome to VForums And Events
                  </CardTitle>
                  <p className="mt-1 text-blue-700 dark:text-blue-300">
                    Your unified platform for campus tech communities
                  </p>
                </div>
              </div>

              {user ? (
                <div className="rounded-lg border border-blue-200/50 bg-white/50 p-4 dark:border-blue-700/50 dark:bg-white/10">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Welcome back, {user.displayName || "Tech Enthusiast"}! 👋
                  </p>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Ready to dive into today&apos;s discussions and upcoming
                    events?
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-blue-200/50 bg-white/50 p-4 dark:border-blue-700/50 dark:bg-white/10">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Join the community! 🚀
                  </p>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Connect with fellow tech enthusiasts and stay updated on
                    events.
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
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Columns - Events & Forums */}
        <div className="space-y-8 lg:col-span-2">
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
                    View All <ArrowRight className="ml-1 h-4 w-4" />
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
                    const community = COMMUNITIES.find(
                      (c) => c.id === event.communityId
                    )
                    return (
                      <div
                        key={event.id}
                        className="rounded-lg border border-border p-4 transition-all duration-200 hover:border-border/80 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/events/${event.id}`}>
                              <h3 className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-blue-500">
                                {event.title}
                              </h3>
                            </Link>
                            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDistanceToNow(new Date(event.dateTime), {
                                  addSuffix: true,
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.rsvpCount || 0}
                              </div>
                            </div>
                          </div>
                          {community && (
                            <Badge
                              variant="community"
                              className="flex-shrink-0"
                            >
                              {community.icon && (
                                <community.icon className="mr-1 h-3 w-3" />
                              )}
                              {community.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No upcoming events at the moment</p>
                  {user && (
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/events/create">Create Your First Event</Link>
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
                    Browse Forums <ArrowRight className="ml-1 h-4 w-4" />
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
                    const community = COMMUNITIES.find(
                      (c) => c.id === question.communityId
                    )
                    return (
                      <div
                        key={question.id}
                        className="rounded-lg border border-border p-4 transition-all duration-200 hover:border-border/80 hover:shadow-md"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <Link
                              href={`/qna/${question.id}`}
                              className="flex-1"
                            >
                              <h3 className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-blue-500">
                                {question.title}
                              </h3>
                            </Link>
                            {community && (
                              <Badge
                                variant="community"
                                className="flex-shrink-0"
                              >
                                {community.icon && (
                                  <community.icon className="mr-1 h-3 w-3" />
                                )}
                                {community.name}
                              </Badge>
                            )}
                          </div>

                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {question.content}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage
                                    src={question.author.photoURL || undefined}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {question.author.displayName?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                {question.author.displayName || "Anonymous"}
                              </div>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(
                                  new Date(question.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
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
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
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
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No recent discussions</p>
                  {user && (
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/qna/ask">Start a Discussion</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle size="md" className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start border border-border"
              >
                <Link href="/qna/ask">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask a Question
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start border border-border"
              >
                <Link href="/events/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start border border-border"
              >
                <Link href="/community/all">
                  <Users className="mr-2 h-4 w-4" />
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
                <span className="text-sm text-muted-foreground">
                  Active Discussions
                </span>
                <Badge variant="secondary">{recentForums.length}+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Upcoming Events
                </span>
                <Badge variant="secondary">{upcomingEvents.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Communities
                </span>
                <Badge variant="secondary">5</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
