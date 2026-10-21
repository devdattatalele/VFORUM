"use client"

import Link from "next/link"
import { Loader2, ShieldAlert } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { hasPermission } from "@/lib/utils/userUtils"

// Client-side gate for workspace pages. The server checks again on every
// action, so this only decides what to render.
export default function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Sign in required"
        action={
          <Button asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
        }
      >
        This page is for moderators and admins.
      </EmptyState>
    )
  }

  if (!hasPermission(user, permission)) {
    return (
      <EmptyState icon={ShieldAlert} title="Not available">
        Your account does not have access to this page.
      </EmptyState>
    )
  }

  return <>{children}</>
}
