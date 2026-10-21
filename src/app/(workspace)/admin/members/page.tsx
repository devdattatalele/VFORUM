"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Search } from "lucide-react"
import { toast } from "sonner"
import PageHeader from "@/components/PageHeader"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import { getAllUsers, updateUserRole } from "@/lib/services/userService"
import type { UserProfile } from "@/lib/types"

type Role = NonNullable<UserProfile["role"]>
const ROLES: { value: Role; label: string }[] = [
  { value: "user", label: "Member" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
]

function Members() {
  const { user } = useAuth()
  const [members, setMembers] = useState<UserProfile[] | null>(null)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")

  useEffect(() => {
    idToken()
      .then(getAllUsers)
      .then((list) =>
        setMembers(
          list.sort((a, b) =>
            (a.displayName ?? "").localeCompare(b.displayName ?? "")
          )
        )
      )
      .catch(() => setMembers([]))
  }, [])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (members ?? []).filter(
      (m) =>
        (roleFilter === "all" || (m.role ?? "user") === roleFilter) &&
        (!q ||
          m.displayName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q))
    )
  }, [members, query, roleFilter])

  const setRole = async (member: UserProfile, role: Role) => {
    try {
      await updateUserRole(await idToken(), member.uid, role)
      setMembers((list) =>
        (list ?? []).map((m) => (m.uid === member.uid ? { ...m, role } : m))
      )
      toast.success(
        `${member.displayName ?? member.email} is now ${ROLES.find((r) => r.value === role)?.label.toLowerCase()}`
      )
    } catch {
      toast.error("Could not change the role")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Filter members"
            placeholder="Filter by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as Role | "all")}
        >
          <SelectTrigger aria-label="Role" className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}s
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!members ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {shown.length} of {members.length} members
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="w-44">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((m) => {
                  const self = m.uid === user?.uid
                  return (
                    <TableRow key={m.uid}>
                      <TableCell>
                        <Link
                          href={`/u/${m.uid}`}
                          className="font-medium hover:underline"
                        >
                          {m.displayName ?? "Unnamed"}
                        </Link>
                        {self && (
                          <span className="text-muted-foreground"> (you)</span>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {m.email}
                        </p>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {m.createdAt
                          ? formatDistanceToNow(new Date(m.createdAt), {
                              addSuffix: true,
                            })
                          : ""}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={m.role ?? "user"}
                          onValueChange={(v) => setRole(m, v as Role)}
                          disabled={self}
                        >
                          <SelectTrigger
                            aria-label={`Role for ${m.displayName ?? m.email}`}
                            className="h-8"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            You cannot change your own role here. Addresses in ADMIN_EMAILS are
            always admins.
          </p>
        </>
      )}
    </div>
  )
}

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        description="Everyone who has signed in. Moderators create events and moderate the forum; admins also manage roles."
      />
      <RequirePermission permission="manage_users">
        <Members />
      </RequirePermission>
    </>
  )
}
