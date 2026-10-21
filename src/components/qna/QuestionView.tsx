"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Link2, Lock, Pin } from "lucide-react"
import { toast } from "sonner"
import Markdown from "@/components/Markdown"
import QuestionActions from "@/components/qna/QuestionActions"
import QuestionEditForm from "@/components/qna/QuestionEditForm"
import SolvedBadge from "@/components/qna/SolvedBadge"
import VoteButtons from "@/components/qna/VoteButtons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { COMMUNITIES } from "@/lib/constants"
import type { Question } from "@/lib/types"

type Edit = { title: string; content: string; tags: string[] }

export default function QuestionView({
  question,
  editing,
  onEdit,
  onCancelEdit,
  onSave,
  onChange,
}: {
  question: Question
  editing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSave: (edit: Edit) => Promise<void>
  onChange: (changes: Partial<Question>) => void
}) {
  const community = COMMUNITIES.find((c) => c.id === question.communityId)
  const author = question.author.displayName || "Anonymous"

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/qna/${question.id}`
      )
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {community && (
            <Link
              href={`/community/${community.id}`}
              className="hover:text-foreground"
            >
              {community.name}
            </Link>
          )}
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
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {question.title}
          </h1>
          {!editing && (
            <QuestionActions
              question={question}
              onEdit={onEdit}
              onChange={onChange}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={question.author.photoURL ?? undefined} alt="" />
            <AvatarFallback className="bg-secondary text-[11px]">
              {author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/u/${question.author.uid}`}
            className="font-medium text-foreground hover:underline"
          >
            {author}
          </Link>
          <span>
            · asked{" "}
            {formatDistanceToNow(new Date(question.createdAt), {
              addSuffix: true,
            })}
            {question.updatedAt && " · edited"} ·{" "}
            <span className="font-mono text-xs">{question.views} views</span>
          </span>
        </div>
      </header>

      {editing ? (
        <QuestionEditForm
          initialData={{
            title: question.title,
            content: question.content,
            tags: question.tags,
          }}
          onSubmit={onSave}
          onCancel={onCancelEdit}
        />
      ) : (
        <Markdown className="text-base">{question.content}</Markdown>
      )}

      {question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
              <Badge
                variant="outline"
                className="font-mono font-normal hover:bg-accent"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-y py-3">
        <VoteButtons
          id={question.id}
          type="question"
          initialUpvotes={question.upvotes}
          initialDownvotes={question.downvotes}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={share}
        >
          <Link2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </article>
  )
}
