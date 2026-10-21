"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CalendarDays, MessageSquare, Users } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import EventRow from "@/components/events/EventRow"
import PageHeader, { SectionHeader } from "@/components/PageHeader"
import QuestionRow from "@/components/qna/QuestionRow"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { COMMUNITIES } from "@/lib/constants"
import { getEventsByCommunity } from "@/lib/services/eventService"
import { getQuestionsByCommunity } from "@/lib/services/questionService"
import type { Event, Question } from "@/lib/types"

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>()
  const { user } = useAuth()
  const community = COMMUNITIES.find(
    (c) => c.id === communityId && c.id !== "all"
  )
  const [data, setData] = useState<{
    questions: Question[]
    events: Event[]
  } | null>(null)

  useEffect(() => {
    if (!community) return
    Promise.all([
      getQuestionsByCommunity(community.id),
      getEventsByCommunity(community.id),
    ])
      .then(([questions, events]) => setData({ questions, events }))
      .catch(() => setData({ questions: [], events: [] }))
  }, [community])

  if (!community) {
    return (
      <EmptyState
        icon={Users}
        title="Community not found"
        action={
          <Button asChild variant="outline">
            <Link href="/communities">All communities</Link>
          </Button>
        }
      />
    )
  }

  const questions = [...(data?.questions ?? [])]
    .sort((a, b) =>
      (b.lastActivityAt ?? b.createdAt).localeCompare(
        a.lastActivityAt ?? a.createdAt
      )
    )
    .slice(0, 10)
  const upcoming = (data?.events ?? [])
    .filter((e) => new Date(e.dateTime).getTime() >= Date.now())
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime))

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title={community.name}
        description={community.description}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/qna?community=${community.id}`}>All questions</Link>
            </Button>
            <Button asChild>
              <Link
                href={user ? `/qna/ask?community=${community.id}` : "/auth"}
              >
                Ask here
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <SectionHeader
            title="Recent questions"
            meta={
              data &&
              `${data.questions.length} ${data.questions.length === 1 ? "question" : "questions"}`
            }
          />
          {!data ? (
            <Skeleton className="h-40 w-full" />
          ) : questions.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No questions here yet">
              Ask the first one.
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <QuestionRow key={q.id} question={q} />
              ))}
            </div>
          )}
        </section>
        <aside>
          <SectionHeader title="Upcoming events" />
          {!data ? (
            <Skeleton className="h-20 w-full" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events"
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {upcoming.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
