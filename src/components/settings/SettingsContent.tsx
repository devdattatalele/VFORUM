"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { SectionHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import { updateMyProfile } from "@/lib/services/userService"

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export default function SettingsContent() {
  const { user, signOut, refreshUserProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(user?.displayName ?? "")
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => setName(user?.displayName ?? ""), [user?.displayName])

  if (!user) {
    return (
      <p className="text-muted-foreground">
        <Link
          href="/auth?redirect=/settings"
          className="text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>{" "}
        to change your settings.
      </p>
    )
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateMyProfile(await idToken(), { displayName: name })
      await refreshUserProfile()
      toast.success("Name updated")
    } catch {
      toast.error("Could not update your name", {
        description: "Use 2 to 60 characters.",
      })
    } finally {
      setSaving(false)
    }
  }

  const facts = [
    { label: "Email", value: user.email },
    {
      label: "Role",
      value: { user: "Member", moderator: "Moderator", admin: "Admin" }[
        user.role ?? "user"
      ],
    },
    {
      label: "Joined",
      value: user.createdAt
        ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
        : "Recently",
    },
  ]

  return (
    <div className="space-y-12">
      <section>
        <SectionHeader
          title="Profile"
          meta={
            <Link href={`/u/${user.uid}`} className="hover:text-foreground">
              View public profile
            </Link>
          }
        />
        <form onSubmit={save} className="max-w-md space-y-3">
          <Label htmlFor="display-name">Display name</Label>
          <div className="flex gap-2">
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
            <Button
              type="submit"
              loading={saving}
              disabled={name.trim() === (user.displayName ?? "")}
            >
              Save
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Shown on what you post from now on. Earlier posts keep the name they
            were written under.
          </p>
        </form>
        <dl className="mt-6 grid max-w-md grid-cols-3 border-t">
          {facts.map((f) => (
            <div key={f.label} className="border-b py-3 pr-3">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </dt>
              <dd className="mt-1 truncate text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <SectionHeader title="Appearance" />
        <div
          role="radiogroup"
          aria-label="Theme"
          className="flex flex-wrap gap-2"
        >
          {THEMES.map((t) => (
            <Button
              key={t.value}
              role="radio"
              aria-checked={mounted && theme === t.value}
              variant={mounted && theme === t.value ? "default" : "outline"}
              onClick={() => setTheme(t.value)}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Privacy" />
        <p className="max-w-xl text-sm text-muted-foreground">
          Your profile shows your name, questions, answers and upvotes. Your
          email address is never shown to other members. Notifications appear in
          the bell in the header; vforum does not send email.
        </p>
      </section>

      <section>
        <SectionHeader title="Session" />
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </section>
    </div>
  )
}
