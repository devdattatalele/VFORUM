"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import PageHeader, { SectionHeader } from "@/components/PageHeader"
import QuestionForm from "@/components/qna/QuestionForm"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const TIPS = [
  "Search the forum first; it may already be answered.",
  "Say what you tried and what happened instead.",
  "Paste code and errors as text, in a fenced block with the language.",
  "Pick the closest community and a few specific tags.",
]

function Ask() {
  const { user, loading } = useAuth()
  const params = useSearchParams()

  if (loading) {
    return (
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
    )
  }
  if (!user) {
    return (
      <EmptyState
        title="Sign in to ask"
        action={
          <Button asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
        }
      >
        Asking needs a @vit.edu.in account.
      </EmptyState>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <QuestionForm defaultCommunity={params.get("community")} />
      <aside>
        <SectionHeader title="Good questions get answered" />
        <ol className="space-y-3 text-sm text-muted-foreground">
          {TIPS.map((tip, i) => (
            <li key={tip} className="flex gap-3">
              <span className="font-mono text-xs text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              {tip}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}

export default function AskPage() {
  return (
    <>
      <PageHeader
        title="Ask a question"
        description="Your question is public to everyone at VIT."
      />
      <Suspense>
        <Ask />
      </Suspense>
    </>
  )
}
