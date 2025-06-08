"use client";

import EventForm from "@/components/events/EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Basic client-side protection. Real protection should be server-side.
  // For now, any authenticated user can access. This could be expanded with roles.
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/events?auth_required=true'); // Redirect if not logged in
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-6 w-6 text-destructive"/> Access Denied</CardTitle>
          <CardDescription>You need to be signed in to create an event.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please sign in to continue.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Placeholder for moderator check - in a real app, this would check user.role or similar
  const isModerator = true; // Assume user is a moderator for now if logged in

  if (!isModerator) {
    return (
       <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-6 w-6 text-destructive"/> Authorization Required</CardTitle>
          <CardDescription>You do not have permission to create events.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Event creation is restricted to club moderators. If you believe this is an error, please contact support.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">Create New Event</h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the information below to create a new event for the campus community.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}