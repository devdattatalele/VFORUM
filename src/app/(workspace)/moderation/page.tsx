"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Flag } from "lucide-react"
import { toast } from "sonner"
import EmptyState from "@/components/EmptyState"
import PageHeader, { SectionHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import RequirePermission from "@/components/workspace/RequirePermission"
import { idToken } from "@/lib/client-auth"
import {
  getOpenReports,
  resolveReports,
} from "@/lib/services/moderationService"
import type { Report } from "@/lib/types"

type Group = { key: string; reports: Report[] }

function Queue() {
  const [reports, setReports] = useState<Report[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setReports(await getOpenReports(await idToken()))
    } catch {
      setReports([])
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])

  // One card per reported item, however many people reported it.
  const groups = useMemo<Group[]>(() => {
    const byKey = new Map<string, Report[]>()
    for (const r of reports ?? []) {
      const key = `${r.questionId}/${r.commentId ?? ""}`
      byKey.set(key, [...(byKey.get(key) ?? []), r])
    }
    return [...byKey].map(([key, list]) => ({ key, reports: list }))
  }, [reports])

  const resolve = async (group: Group, action: "dismiss" | "remove") => {
    const { questionId, commentId } = group.reports[0]
    setBusy(group.key)
    try {
      await resolveReports(await idToken(), questionId, commentId, action)
      toast.success(action === "remove" ? "Removed" : "Reports dismissed")
      await load()
    } catch {
      toast.error("Could not resolve the reports")
    } finally {
      setBusy(null)
    }
  }

  return (
    <section>
      <SectionHeader
        title="Open reports"
        meta={
          reports &&
          `${groups.length} ${groups.length === 1 ? "item" : "items"}`
        }
      />
      {reports === null ? (
        <Skeleton className="h-32 w-full" />
      ) : groups.length === 0 ? (
        <EmptyState icon={Flag} title="Nothing to review">
          Reports from students appear here.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const first = group.reports[0]
            const href = `/qna/${first.questionId}${first.commentId ? `#comment-${first.commentId}` : ""}`
            return (
              <article key={group.key} className="rounded-lg border bg-card">
                <div className="space-y-2 p-5">
                  <p className="text-sm text-muted-foreground">
                    {first.commentId ? "Comment" : "Question"} by{" "}
                    {first.targetAuthor.displayName ?? "unknown"} on{" "}
                    <Link
                      href={href}
                      className="text-foreground underline underline-offset-4"
                    >
                      {first.questionTitle}
                    </Link>
                  </p>
                  <blockquote className="border-l-2 pl-3 text-sm">
                    {first.excerpt || "(no text)"}
                  </blockquote>
                  <ul className="space-y-1 pt-1 text-sm text-muted-foreground">
                    {group.reports.map((r) => (
                      <li key={r.id}>
                        <Badge
                          variant="outline"
                          className="mr-2 font-mono font-normal"
                        >
                          {r.reason}
                        </Badge>
                        {r.reporter.displayName ?? "Someone"},{" "}
                        {formatDistanceToNow(new Date(r.createdAt), {
                          addSuffix: true,
                        })}
                        {r.details && <span>: {r.details}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end gap-2 border-t px-5 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy === group.key}
                    onClick={() => resolve(group, "dismiss")}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy === group.key}
                    onClick={() => resolve(group, "remove")}
                  >
                    Remove {first.commentId ? "comment" : "question"}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default function ModerationPage() {
  return (
    <>
      <PageHeader
        title="Moderation"
        description="Reports from students, newest first. Removing deletes the item and closes every report on it."
      />
      <RequirePermission permission="moderate_forums">
        <Queue />
      </RequirePermission>
    </>
  )
}
