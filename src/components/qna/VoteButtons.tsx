"use client"

import { useEffect, useState } from "react"
import { ArrowBigDown, ArrowBigUp, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import {
  getUserVote,
  voteOnComment,
  voteOnQuestion,
} from "@/lib/services/voteService"
import { cn } from "@/lib/utils"
import { voteDelta, type VoteType } from "@/lib/votes"

// Up and down votes on questions, a single like on comments. Updates
// optimistically with the same arithmetic the server applies.
export default function VoteButtons({
  id,
  type,
  questionId,
  initialUpvotes,
  initialDownvotes = 0,
  mode = "upvote",
}: {
  id: string
  type: "question" | "comment"
  questionId?: string
  initialUpvotes: number
  initialDownvotes?: number
  mode?: "upvote" | "like"
}) {
  const { user } = useAuth()
  const [up, setUp] = useState(initialUpvotes)
  const [down, setDown] = useState(initialDownvotes)
  const [vote, setVote] = useState<VoteType>("none")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    idToken()
      .then((token) => getUserVote(token, id, type))
      .then(setVote)
      .catch(() => {})
  }, [id, type, user])

  const cast = async (pressed: "up" | "down") => {
    if (!user) {
      toast.error("Sign in to vote")
      return
    }
    if (busy) return
    const previous = vote
    const next: VoteType = vote === pressed ? "none" : pressed
    const delta = voteDelta(previous, next)
    setVote(next)
    setUp((n) => n + delta.up)
    setDown((n) => n + delta.down)
    setBusy(true)
    try {
      const token = await idToken()
      if (type === "question") await voteOnQuestion(token, id, next)
      else if (questionId) await voteOnComment(token, questionId, id, next)
    } catch {
      setVote(previous)
      setUp((n) => n - delta.up)
      setDown((n) => n - delta.down)
      toast.error("Could not record your vote")
    } finally {
      setBusy(false)
    }
  }

  if (mode === "like") {
    const liked = vote === "up"
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => cast("up")}
        disabled={busy}
        aria-pressed={liked}
        aria-label={liked ? "Remove like" : "Like"}
        className={cn(
          "h-8 gap-1.5 px-2 text-muted-foreground",
          liked && "text-brand"
        )}
      >
        <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
        <span className="font-mono text-xs">{up}</span>
      </Button>
    )
  }

  return (
    <div className="inline-flex items-center rounded-md border p-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => cast("up")}
        disabled={busy}
        aria-pressed={vote === "up"}
        aria-label="Upvote"
        className={cn(vote === "up" && "text-brand")}
      >
        <ArrowBigUp
          className={cn("h-5 w-5", vote === "up" && "fill-current")}
        />
      </Button>
      <span
        className="min-w-7 text-center font-mono text-sm font-medium"
        aria-label="Score"
      >
        {up - down}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => cast("down")}
        disabled={busy}
        aria-pressed={vote === "down"}
        aria-label="Downvote"
        className={cn(vote === "down" && "text-brand")}
      >
        <ArrowBigDown
          className={cn("h-5 w-5", vote === "down" && "fill-current")}
        />
      </Button>
    </div>
  )
}
