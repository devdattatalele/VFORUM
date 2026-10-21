"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import EmptyState from "@/components/EmptyState"
import AnswerThread from "@/components/qna/AnswerThread"
import QuestionView from "@/components/qna/QuestionView"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import {
  addComment,
  deleteComment,
  getThreadedComments,
} from "@/lib/services/commentService"
import {
  acceptAnswer,
  getQuestionById,
  updateQuestion,
} from "@/lib/services/questionService"
import type { Comment, Question } from "@/lib/types"
import { canModerate, hasPermission } from "@/lib/utils/userUtils"

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [question, setQuestion] = useState<Question | null | undefined>(
    undefined
  )
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [sort, setSort] = useState("top")
  const [editing, setEditing] = useState(false)

  // The question loads once (it counts a view); answers reload on sort.
  useEffect(() => {
    getQuestionById(id)
      .then(setQuestion)
      .catch(() => setQuestion(null))
  }, [id])

  const loadComments = useCallback(
    () =>
      getThreadedComments(id, sort)
        .then(setComments)
        .catch(() => setComments([])),
    [id, sort]
  )
  useEffect(() => {
    loadComments()
  }, [loadComments])

  // Notification links point at #comment-<id>; answers render after load.
  const loaded = comments !== null
  useEffect(() => {
    if (!loaded) return
    const target = window.location.hash.slice(1)
    if (target)
      document.getElementById(target)?.scrollIntoView({ block: "center" })
  }, [loaded])

  if (question === undefined) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (question === null) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="Question not found"
        action={
          <Button asChild variant="outline">
            <Link href="/qna">Back to the forum</Link>
          </Button>
        }
      >
        It may have been deleted, or the link is wrong.
      </EmptyState>
    )
  }

  const answer = async (content: string, parentId: string | null) => {
    await addComment(await idToken(), question.id, { content, parentId })
    setQuestion({ ...question, replyCount: question.replyCount + 1 })
    await loadComments()
  }

  const save = async (edit: {
    title: string
    content: string
    tags: string[]
  }) => {
    try {
      await updateQuestion(await idToken(), question.id, edit)
      setQuestion({ ...question, ...edit, updatedAt: new Date().toISOString() })
      setEditing(false)
      toast.success("Question updated")
    } catch {
      toast.error("Could not save your changes")
    }
  }

  const accept = async (commentId: string | null) => {
    try {
      await acceptAnswer(await idToken(), question.id, commentId)
      setQuestion({ ...question, acceptedAnswerId: commentId })
      toast.success(commentId ? "Answer accepted" : "Accepted answer cleared")
    } catch {
      toast.error("Could not update the accepted answer")
    }
  }

  const remove = async (commentId: string) => {
    try {
      await deleteComment(await idToken(), question.id, commentId)
      setQuestion({
        ...question,
        replyCount: Math.max(0, question.replyCount - 1),
        acceptedAnswerId:
          question.acceptedAnswerId === commentId
            ? null
            : question.acceptedAnswerId,
      })
      await loadComments()
      toast.success("Comment deleted")
    } catch {
      toast.error("Could not delete the comment")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        href="/qna"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Forum
      </Link>
      <QuestionView
        question={question}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onSave={save}
        onChange={(changes) => setQuestion({ ...question, ...changes })}
      />
      <AnswerThread
        questionId={question.id}
        comments={comments}
        acceptedId={question.acceptedAnswerId ?? null}
        locked={!!question.locked}
        canAnswer={!question.locked || hasPermission(user, "moderate_forums")}
        canAccept={canModerate(user, question.author.uid)}
        sort={sort}
        onSortChange={setSort}
        onAnswer={answer}
        onEdited={loadComments}
        onAccept={accept}
        onDelete={remove}
      />
    </div>
  )
}
