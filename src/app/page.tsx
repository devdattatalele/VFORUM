"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/events');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen_minus_header p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Loading Campus Tech Hub...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen_minus_header p-8 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold font-headline mb-6 text-primary">Welcome to Campus Tech Hub!</h1>
          <p className="text-xl text-foreground mb-8">
            Your central place for all tech events, Q&A, and community discussions at VIT.
          </p>
          <p className="text-md text-muted-foreground mb-10">
            Connect with clubs, ask questions, share knowledge, and stay updated on the latest happenings.
          </p>
          <Button size="lg" onClick={signInWithGoogle} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Sign In with Google to Get Started
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            (Requires a @vit.edu.in email address)
          </p>
        </div>
      </div>
    );
  }
  
  // Fallback for when user is loaded but redirect hasn't happened yet
   return (
      <div className="flex flex-col items-center justify-center min-h-screen_minus_header p-8 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Redirecting...</p>
      </div>
    );
}

// Helper for screen height minus header (approximate)
// You might need to adjust this or use a more robust CSS solution
// For tailwind.config.js:
// theme: { extend: { minHeight: { 'screen_minus_header': 'calc