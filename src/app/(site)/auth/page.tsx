"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DevSignIn from "@/components/dev/DevSignIn"
import AuthForm from "@/components/ui/auth-form"
import { useAuth } from "@/contexts/AuthContext"

// Only same-site paths, so a crafted link cannot bounce people off-site.
function safeRedirect(target: string | null): string {
  return target && target.startsWith("/") && !target.startsWith("//")
    ? target
    : "/qna"
}

function SignIn() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()
  const next = safeRedirect(params.get("redirect"))

  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [user, loading, router, next])

  return (
    <div className="mx-auto max-w-sm space-y-6 py-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to vforum
        </h1>
        <p className="text-sm text-muted-foreground">
          Use your @vit.edu.in email. Reading is open to everyone; asking,
          answering and voting need an account.
        </p>
      </div>
      <DevSignIn />
      <AuthForm />
      <p className="text-center text-xs text-muted-foreground">
        Keep it respectful. Moderators can remove posts that break the rules.
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  )
}
