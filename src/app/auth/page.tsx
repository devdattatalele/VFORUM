"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  Loader2,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import AuthForm from "@/components/ui/auth-form"
import { Badge } from "@/components/ui/badge"

export default function AuthPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-foreground">Loading VForums And Events...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="grid min-h-screen items-center gap-12 lg:grid-cols-2">
            {/* Left Side - Branding and Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="font-headline text-4xl font-bold text-foreground">
                    VForums And Events
                  </h1>
                </div>

                <p className="text-xl leading-relaxed text-muted-foreground">
                  Join VIT&apos;s premier community platform for knowledge
                  sharing, networking, and discovering exciting events.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Users className="mr-1 h-3 w-3" />
                    Connect with all VIT Students
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <MessageCircle className="mr-1 h-3 w-3" />
                    Post your Forums and get answers
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    Track All upcoming Events
                  </Badge>
                </div>
              </div>

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
                <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
                  <div className="mb-6 text-center">
                    <h2 className="mb-2 font-headline text-2xl font-semibold text-foreground">
                      Join the Community
                    </h2>
                    <p className="text-muted-foreground">
                      Sign in with your VIT email to get started
                    </p>
                  </div>

                  <AuthForm />

                  <div className="mt-6 border-t border-border/50 pt-6">
                    <p className="text-center text-xs text-muted-foreground">
                      By signing in, you agree to our community guidelines and
                      acknowledge you&apos;re a verified VIT student.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-foreground">Redirecting to home...</p>
    </div>
  )
}
