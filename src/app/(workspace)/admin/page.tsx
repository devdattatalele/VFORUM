"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { RefreshCw } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarSeries, WeeklyChart } from "@/components/workspace/AnalyticsCharts"
import RequirePermission from "@/components/workspace/RequirePermission"
import type { ForumAnalytics } from "@/lib/analytics"
import { idToken } from "@/lib/client-auth"
import { getForumAnalytics } from "@/lib/services/analyticsService"

const compact = new Intl.NumberFormat("en", { notation: "compact" })
const percent = (v: number | null) =>
  v === null ? "No data" : `${Math.round(v * 100)}%`

function duration(hours: number | null): string {
  if (hours === null) return "No data"
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 48) return `${hours.toFixed(1)} h`
  return `${(hours / 24).toFixed(1)} days`
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Dashboard() {
  const [data, setData] = useState<ForumAnalytics | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setError(false)
    try {
      setData(await getForumAnalytics(await idToken()))
    } catch {
      setError(true)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])

  if (error) {
    return (
      <p className="text-muted-foreground">
        Could not load analytics.{" "}
        <button
          type="button"
          onClick={load}
          className="text-foreground underline underline-offset-4"
        >
          Try again
        </button>
      </p>
    )
  }
  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const { totals } = data
  const trend = totals.questions30d - totals.questionsPrev30d
  const tiles = [
    {
      label: "Questions",
      value: compact.format(totals.questions),
      hint: `${totals.questions30d} in the last 30 days${trend ? `, ${Math.abs(trend)} ${trend > 0 ? "more" : "fewer"} than the 30 before` : ""}`,
    },
    {
      label: "Answered",
      value: percent(data.answerRate),
      hint: "have an answer from someone else",
    },
    {
      label: "Solved",
      value: percent(data.solvedRate),
      hint: "have an accepted answer",
    },
    {
      label: "Time to first answer",
      value: duration(data.medianFirstAnswerHours),
      hint: "median, answered questions",
    },
    {
      label: "Members",
      value: compact.format(totals.members),
      hint: `${totals.activeMembers30d} active in the last 30 days`,
    },
  ]

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{t.label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{t.value}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">{t.hint}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Questions and answers per week">
        <WeeklyChart data={data.weekly} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Time to first answer">
          <BarSeries
            label="Questions"
            data={data.firstAnswer.map((b) => ({
              name: b.bucket,
              value: b.count,
            }))}
          />
        </Panel>
        <Panel title="Top tags">
          <BarSeries
            horizontal
            label="Questions"
            data={data.topTags.map((t) => ({ name: t.tag, value: t.count }))}
          />
        </Panel>
        <Panel title="Questions by community">
          <BarSeries
            horizontal
            label="Questions"
            data={data.byCommunity.map((c) => ({
              name: c.community,
              value: c.count,
            }))}
          />
        </Panel>
        <Panel title="Top contributors">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 font-normal">Member</th>
                <th className="py-2 text-right font-normal">Answers</th>
                <th className="py-2 text-right font-normal">Accepted</th>
                <th className="py-2 text-right font-normal">Likes</th>
              </tr>
            </thead>
            <tbody>
              {data.topContributors.map((c) => (
                <tr key={c.uid} className="border-b last:border-0">
                  <td className="py-2">
                    <Link href={`/u/${c.uid}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {c.answers}
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {c.accepted}
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">
                    {c.likes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Generated{" "}
          {formatDistanceToNow(new Date(data.generatedAt), { addSuffix: true })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setData(null)
            load()
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="How the forum is doing: activity, answer rates and who is helping."
      />
      <RequirePermission permission="manage_users">
        <Dashboard />
      </RequirePermission>
    </>
  )
}
