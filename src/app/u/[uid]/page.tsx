"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Loader2, UserCircle } from "lucide-react"
import SolvedBadge from "@/components/qna/SolvedBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { excerpt } from "@/lib/markdown"
import { getPublicProfile } from "@/lib/services/profileService"
import type { PublicProfile } from "@/lib/types"

const compact = new Intl.NumberFormat("en", { notation: "compact" })
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
const ago = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true })

export default function ProfilePage() {
  const { uid } = useParams<{ uid: string }>()
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(
    undefined
  )

  useEffect(() => {
    getPublicProfile(uid)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [uid])

  if (profile === undefined) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (profile === null) {
    return (
      <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
        <UserCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">No such member</p>
      </Card>
    )
  }

  const name = profile.displayName ?? "Anonymous"
  const stats = [
    { label: "Questions", value: profile.stats.questions },
    { label: "Answers", value: profile.stats.answers },
    { label: "Accepted answers", value: profile.stats.accepted },
    { label: "Upvotes received", value: profile.stats.upvotes },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.photoURL ?? undefined} alt={name} />
          <AvatarFallback className="text-2xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="flex flex-wrap items-center gap-3 font-headline text-3xl font-bold">
            {name}
            {profile.role !== "user" && (
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
            )}
          </h1>
          {profile.joinedAt && (
            <p className="mt-1 text-muted-foreground">
              Joined {ago(profile.joinedAt)}
            </p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-foreground">
                {compact.format(s.value)}
              </dd>
            </CardContent>
          </Card>
        ))}
      </dl>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-4 space-y-3">
          {profile.questions.length === 0 ? (
            <p className="text-muted-foreground">No questions yet.</p>
          ) : (
            profile.questions.map((q) => (
              <Card key={q.id}>
                <CardContent className="space-y-1 p-4">
                  <Link
                    href={`/qna/${q.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {q.title}
                  </Link>
                  {q.acceptedAnswerId && <SolvedBadge className="ml-2" />}
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {excerpt(q.content, 140)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count(q.upvotes, "upvote")} ·{" "}
                    {q.replyCount === 1 ? "1 reply" : `${q.replyCount} replies`}{" "}
                    · asked {ago(q.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="answers" className="mt-4 space-y-3">
          {profile.answers.length === 0 ? (
            <p className="text-muted-foreground">No answers yet.</p>
          ) : (
            profile.answers.map((a) => (
              <Card key={a.commentId}>
                <CardContent className="space-y-1 p-4">
                  <Link
                    href={`/qna/${a.questionId}#comment-${a.commentId}`}
                    className="font-medium hover:text-primary"
                  >
                    {a.questionTitle}
                  </Link>
                  {a.accepted && (
                    <SolvedBadge label="Accepted" className="ml-2" />
                  )}
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {a.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count(a.upvotes, "like")} · answered {ago(a.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
