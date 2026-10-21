"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Flag, Loader2, ScrollText, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { idToken } from "@/lib/client-auth"
import {
  getAuditLog,
  getOpenReports,
  resolveReports,
} from "@/lib/services/moderationService"
import type { AuditEntry, Report } from "@/lib/types"
import { hasPermission } from "@/lib/utils/userUtils"

type Group = { key: string; reports: Report[] }

export default function ModerationPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[] | null>(null)
  const [audit, setAudit] = useState<AuditEntry[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const isModerator = hasPermission(user, "moderate_forums")
  const isAdmin = hasPermission(user, "manage_users")

  const load = useCallback(async () => {
    const token = await idToken()
    setReports(await getOpenReports(token))
    if (isAdmin) setAudit(await getAuditLog(token))
  }, [isAdmin])

  useEffect(() => {
    if (isModerator) load().catch(() => setReports([]))
  }, [isModerator, load])

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
      toast({
        title: action === "remove" ? "Content removed" : "Reports dismissed",
      })
      await load()
    } catch {
      toast({ title: "Could not resolve the reports", variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isModerator) {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Moderators only
          </CardTitle>
          <CardDescription>
            This page is for forum moderators and admins.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div>
        <h1 className="font-headline text-4xl font-bold">Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Reports from students, newest first. Removing deletes the question or
          comment and closes every report on it.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Flag className="h-5 w-5" /> Open reports
          {reports && <Badge variant="secondary">{groups.length}</Badge>}
        </h2>
        {reports === null ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : groups.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-muted-foreground">
            Nothing to review.
          </p>
        ) : (
          groups.map((group) => {
            const first = group.reports[0]
            const href = `/qna/${first.questionId}${first.commentId ? `#comment-${first.commentId}` : ""}`
            return (
              <Card key={group.key}>
                <CardHeader className="pb-3">
                  <CardDescription>
                    {first.commentId ? "Comment" : "Question"} by{" "}
                    {first.targetAuthor.displayName ?? "unknown"} on{" "}
                    <Link href={href} className="font-medium underline">
                      {first.questionTitle}
                    </Link>
                  </CardDescription>
                  <p className="text-sm text-foreground">
                    {first.excerpt || "(no text)"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1 text-sm">
                    {group.reports.map((r) => (
                      <li key={r.id} className="text-muted-foreground">
                        <Badge variant="outline" className="mr-2">
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
                  <div className="flex gap-2">
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
                </CardContent>
              </Card>
            )
          })
        )}
      </section>

      {isAdmin && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ScrollText className="h-5 w-5" /> Audit log
          </h2>
          <p className="text-sm text-muted-foreground">
            Role changes, moderator edits and removals, latest 100.
          </p>
          {audit === null ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-xs">
                      {entry.actorEmail}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.action}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-xs">
                      {entry.target}
                      {Object.keys(entry.details).length > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          {JSON.stringify(entry.details)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      )}
    </div>
  )
}
