"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageCircle, Users, TrendingUp, Calendar, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import AuthForm from '@/components/ui/auth-form';
import { Badge } from '@/components/ui/badge';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Side - Branding and Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold font-headline text-foreground">
                    VForums And Events
                  </h1>
                </div>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Join VIT's premier community platform for knowledge sharing, networking, and discovering exciting events.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Connect with all VIT Students
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Post your Forums and get answers
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Track All upcoming Events
                  </Badge>
                </div>
              </div>

              {/* Features List */}
              
              {/* Trust Indicators */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure VIT email authentication</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Verified student community</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Moderated discussions</span>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold font-headline text-foreground mb-2">
                      Join the Community
                    </h2>
                    <p className="text-muted-foreground">
                      Sign in with your VIT email to get started
                    </p>
                  </div>
                  
                  <AuthForm />
                  
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      By signing in, you agree to our community guidelines and 
                      acknowledge you're a verified VIT student.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-foreground">Redirecting to home...</p>
    </div>
  );
} 