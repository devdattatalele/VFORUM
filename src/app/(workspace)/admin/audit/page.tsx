"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ScrollText } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import PageHeader from "@/components/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import RequirePermission from "@/components/workspace/RequirePermission"
import { idToken } from "@/lib/client-auth"
import { getAuditLog } from "@/lib/services/moderationService"
import type { AuditEntry } from "@/lib/types"

function Log() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null)

  useEffect(() => {
    idToken()
      .then(getAuditLog)
      .then(setEntries)
      .catch(() => setEntries([]))
  }, [])

  if (!entries) return <Skeleton className="h-64 w-full" />
  if (entries.length === 0) {
    return <EmptyState icon={ScrollText} title="No privileged actions yet" />
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
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
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(e.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-sm">{e.actorEmail}</TableCell>
              <TableCell className="font-mono text-xs">{e.action}</TableCell>
              <TableCell className="max-w-sm font-mono text-xs text-muted-foreground">
                <span className="block truncate">{e.target}</span>
                {Object.keys(e.details).length > 0 && (
                  <span className="block truncate">
                    {JSON.stringify(e.details)}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AuditPage() {
  return (
    <>
      <PageHeader
        title="Audit log"
        description="Role changes, moderators acting on other people's content, pins, locks and report decisions. Latest 100."
      />
      <RequirePermission permission="manage_users">
        <Log />
      </RequirePermission>
    </>
  )
}
