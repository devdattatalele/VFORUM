"use client"

import EventForm from "@/components/events/EventForm"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, ShieldAlert, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { hasPermission, isModerator } from "@/lib/utils/userUtils"

export default function CreateEventPage() {
  const { user, loading, refreshUserProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?redirect=/events/create")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-destructive" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            You need to be signed in to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Check if user has permission to create events
  const canCreateEvents = hasPermission(user, "create_events")
  const userIsModerator = isModerator(user)

  if (!canCreateEvents) {
    return (
      <Card className="mx-auto mt-10 max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-6 w-6 text-yellow-500" />
            Moderator Access Required
          </CardTitle>
          <CardDescription>
            Only moderators and admins can create events. This helps maintain
            quality and prevents spam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">Current Access Level:</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Role:</strong> {user.role || "user"} <br />
              <strong>Permissions:</strong>{" "}
              {user.permissions?.join(", ") || "Basic user permissions"}
            </p>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
            <h3 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">
              Role Recently Updated?
            </h3>
            <p className="mb-3 text-sm text-yellow-800 dark:text-yellow-200">
              If your role was recently updated by an admin, try refreshing your
              profile to see the latest permissions.
            </p>
            <Button
              onClick={refreshUserProfile}
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900/20"
            >
              Refresh Profile
            </Button>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
              Want to become a moderator?
            </h3>
            <p className="mb-3 text-sm text-blue-800 dark:text-blue-200">
              Moderators help organize events and maintain the community. If
              you&apos;re interested in contributing:
            </p>
            <ul className="mb-3 space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Be an active community member</li>
              <li>• Demonstrate leadership in forums</li>
              <li>• Contact the admin team</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button asChild>
              <Link href="/qna">Join Discussions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Create New Event
          </h1>
        </div>
        <p className="text-muted-foreground">
          As a {user.role}, you can create and manage events for the VIT
          community.
        </p>
      </div>
      <EventForm />
    </div>
  )
}
