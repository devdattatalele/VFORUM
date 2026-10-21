"use client"

import { useMemo, useState } from "react"
import { Lock, MessageSquare, Search } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import CompactCommentForm from "@/components/qna/CompactCommentForm"
import ThreadedCommentCard from "@/components/qna/ThreadedCommentCard"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buildTree, type ThreadNode } from "@/lib/thread"
import type { Comment } from "@/lib/types"

const SORTS = [
  { value: "top", label: "Most liked" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "controversial", label: "Most discussed" },
]

export default function AnswerThread({
  questionId,
  comments,
  acceptedId,
  locked,
  canAnswer,
  canAccept,
  sort,
  onSortChange,
  onAnswer,
  onEdited,
  onAccept,
  onDelete,
}: {
  questionId: string
  comments: Comment[] | null
  acceptedId: string | null
  locked: boolean
  canAnswer: boolean
  canAccept: boolean
  sort: string
  onSortChange: (sort: string) => void
  onAnswer: (content: string, parentId: string | null) => Promise<void>
  onEdited: () => void
  onAccept: (commentId: string | null) => void
  onDelete: (commentId: string) => void
}) {
  const [filter, setFilter] = useState("")

  const tree = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const list = (comments ?? []).filter(
      (c) =>
        !q ||
        c.content.toLowerCase().includes(q) ||
        c.author.displayName?.toLowerCase().includes(q)
    )
    return buildTree(list, acceptedId)
  }, [comments, filter, acceptedId])

  const answers = (comments ?? []).filter(
    (c) => !c.parentId && !c.deleted
  ).length

  const renderNode = (node: ThreadNode, level: number): React.ReactNode => (
    <ThreadedCommentCard
      key={node.id}
      comment={node}
      questionId={questionId}
      level={level}
      onReply={(content, parentId) => onAnswer(content, parentId)}
      onEdited={onEdited}
      isAccepted={level === 0 && node.id === acceptedId}
      canAccept={level === 0 && canAccept && !node.deleted}
      onAccept={onAccept}
      canReply={canAnswer}
      onDelete={onDelete}
    >
      {node.replies.length > 0 &&
        node.replies.map((r) => renderNode(r, level + 1))}
    </ThreadedCommentCard>
  )

  return (
    <section aria-labelledby="answers-title" className="space-y-4">
      <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="answers-title" className="text-lg font-semibold">
          {answers} {answers === 1 ? "answer" : "answers"}
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Filter answers"
              placeholder="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 w-36 pl-8"
            />
          </div>
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger aria-label="Sort answers" className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {locked && (
        <p className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          Moderators locked this question. New answers are closed.
        </p>
      )}
      {canAnswer && (
        <CompactCommentForm
          placeholder="Write an answer"
          submitLabel="Post answer"
          onSubmit={(content) => onAnswer(content, null)}
        />
      )}

      {comments === null ? null : tree.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={filter ? "No answers match" : "No answers yet"}
        >
          {filter ? "Try another word." : "Know the answer? Share it."}
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {tree.map((node) => renderNode(node, 0))}
        </div>
      )}
    </section>
  )
}
