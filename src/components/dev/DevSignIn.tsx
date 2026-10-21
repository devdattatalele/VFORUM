"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { DEV_PASSWORD, DEV_PERSONAS } from "@/lib/dev-personas"
import { usingEmulators } from "@/lib/firebase"

// Persona switcher for `npm run dev:local`. Renders nothing anywhere else.
export default function DevSignIn() {
  const { signIn } = useAuth()
  const [pending, setPending] = useState<string | null>(null)

  if (!usingEmulators) return null

  return (
    <div className="rounded-lg border border-dashed border-brand/50 p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-brand">
        Development sign-in
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Local emulators only. Roles come from the seeded database, exactly as in
        production.
      </p>
      <div className="grid gap-2">
        {DEV_PERSONAS.map((p) => (
          <Button
            key={p.uid}
            variant="outline"
            className="h-auto justify-start whitespace-normal py-2 text-left"
            disabled={pending !== null}
            onClick={async () => {
              setPending(p.uid)
              try {
                await signIn(p.email, DEV_PASSWORD)
              } finally {
                setPending(null)
              }
            }}
          >
            {pending === p.uid && (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            )}
            <span className="flex flex-col">
              <span className="font-medium">
                {p.label}: {p.displayName}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {p.description}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
