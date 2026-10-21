"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { COMMUNITIES } from "@/lib/constants"
import { getQuestions } from "@/lib/services/questionService"

export default function CommunitiesPage() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    getQuestions()
      .then((questions) =>
        setCounts(
          questions.reduce<Record<string, number>>((acc, q) => {
            acc[q.communityId] = (acc[q.communityId] ?? 0) + 1
            return acc
          }, {})
        )
      )
      .catch(() => setCounts({}))
  }, [])

  return (
    <>
      <PageHeader
        title="Communities"
        description="The clubs and groups at VIT. Each has its own questions and events."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COMMUNITIES.filter((c) => c.id !== "all").map((c) => (
          <Link
            key={c.id}
            href={`/community/${c.id}`}
            className="group flex flex-col rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary font-medium">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{c.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {counts
                    ? `${counts[c.id] ?? 0} ${(counts[c.id] ?? 0) === 1 ? "question" : "questions"}`
                    : " "}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            {c.description && (
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {c.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </>
  )
}
