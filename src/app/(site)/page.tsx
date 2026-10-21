"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, MessageSquare } from "lucide-react"
import CommunityList from "@/components/CommunityList"
import EmptyState from "@/components/EmptyState"
import EventRow from "@/components/events/EventRow"
import { Eyebrow, SectionHeader } from "@/components/PageHeader"
import QuestionRow from "@/components/qna/QuestionRow"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { getEvents } from "@/lib/services/eventService"
import { getQuestions } from "@/lib/services/questionService"
import type { Event, Question } from "@/lib/types"

type Data = { questions: Question[]; events: Event[] }

export default function HomePage() {
  const { user } = useAuth()
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    Promise.all([getQuestions(), getEvents()])
      .then(([questions, events]) => setData({ questions, events }))
      .catch(() => setData({ questions: [], events: [] }))
  }, [])

  const questions = data?.questions ?? []
  const now = Date.now()
  const upcoming = (data?.events ?? [])
    .filter((e) => new Date(e.dateTime).getTime() >= now)
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  const recent = [...questions]
    .sort((a, b) =>
      (b.lastActivityAt ?? b.createdAt).localeCompare(
        a.lastActivityAt ?? a.createdAt
      )
    )
    .slice(0, 5)
  const solved = questions.filter((q) => q.acceptedAnswerId).length
  const counts = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.communityId] = (acc[q.communityId] ?? 0) + 1
    return acc
  }, {})

  const stats = [
    { label: "Questions", value: questions.length },
    {
      label: "Answers",
      value: questions.reduce((sum, q) => sum + q.replyCount, 0),
    },
    { label: "Solved", value: solved },
    { label: "Upcoming events", value: upcoming.length },
  ]

  return (
    <div className="space-y-16">
      <section className="grid gap-10 pt-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="space-y-6">
          <Eyebrow>vforum / Vidyalankar Institute of Technology</Eyebrow>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tighter md:text-6xl">
            Ask once.
            <br />
            <span className="text-muted-foreground">
              Find it forever<span className="text-brand">.</span>
            </span>
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Questions from VIT students, answered by VIT students. An answer
            given today stays findable for every batch after.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={user ? "/qna/ask" : "/auth"}>
                Ask a question <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/qna">Browse the forum</Link>
            </Button>
          </div>
        </div>

        <dl className="grid grid-cols-2 border-t">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`border-b py-5 ${i % 2 === 0 ? "border-r pr-5" : "pl-5"}`}
            >
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {data ? s.value : <Skeleton className="h-7 w-12" />}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <SectionHeader
            title="Recent questions"
            meta={
              <Link href="/qna" className="hover:text-foreground">
                View all
              </Link>
            }
          />
          {!data ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No questions yet">
              Be the first to ask one.
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {recent.map((q) => (
                <QuestionRow key={q.id} question={q} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-10">
          <section>
            <SectionHeader
              title="Upcoming events"
              meta={
                <Link href="/events" className="hover:text-foreground">
                  All events
                </Link>
              }
            />
            {!data ? (
              <Skeleton className="h-20 w-full" />
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events.
              </p>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 3).map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            )}
          </section>
          <section>
            <SectionHeader title="Find your community" />
            <CommunityList counts={data ? counts : undefined} />
          </section>
        </aside>
      </div>
    </div>
  )
}
