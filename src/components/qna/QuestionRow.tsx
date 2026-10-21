import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Lock, Pin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SolvedBadge from "@/components/qna/SolvedBadge"
import { COMMUNITIES } from "@/lib/constants"
import { excerpt } from "@/lib/markdown"
import type { Question } from "@/lib/types"

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

// One question as a flat card with a footer strip, like vboard's post cards.
export default function QuestionRow({ question }: { question: Question }) {
  const community = COMMUNITIES.find((c) => c.id === question.communityId)
  const score = question.upvotes - question.downvotes

  return (
    <article className="rounded-lg border bg-card">
      <div className="space-y-2 p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {community && <span>{community.name}</span>}
          {question.pinned && (
            <Badge>
              <Pin className="h-3 w-3" /> Pinned
            </Badge>
          )}
          {question.acceptedAnswerId && <SolvedBadge />}
          {question.locked && (
            <Badge>
              <Lock className="h-3 w-3" /> Locked
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/qna/${question.id}`}
            className="hover:underline hover:underline-offset-4"
          >
            {question.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {excerpt(question.content, 220)}
        </p>
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {question.tags.slice(0, 4).map((tag) => (
              <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline" className="font-mono font-normal">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-sm text-muted-foreground">
        <span>
          <Link
            href={`/u/${question.author.uid}`}
            className="text-foreground hover:underline"
          >
            {question.author.displayName || "Anonymous"}
          </Link>{" "}
          ·{" "}
          {formatDistanceToNow(
            new Date(question.lastActivityAt || question.createdAt),
            { addSuffix: true }
          )}
        </span>
        <span className="font-mono text-xs">
          {plural(question.replyCount, "answer", "answers")} ·{" "}
          {plural(score, "vote", "votes")} ·{" "}
          {plural(question.views, "view", "views")}
        </span>
      </div>
    </article>
  )
}
