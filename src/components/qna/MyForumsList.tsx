"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquare, Trash2 } from "lucide-react"
import { toast } from "sonner"
import EmptyState from "@/components/EmptyState"
import { SectionHeader } from "@/components/PageHeader"
import QuestionRow from "@/components/qna/QuestionRow"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import { deleteQuestion, getQuestions } from "@/lib/services/questionService"
import type { Question } from "@/lib/types"

// The signed-in member's own questions, newest activity first, with delete.
export default function MyForumsList() {
  const { user, loading } = useAuth()
  const [questions, setQuestions] = useState<Question[] | null>(null)

  useEffect(() => {
    if (!user) return
    getQuestions()
      .then((all) =>
        setQuestions(
          all
            .filter((q) => q.author.uid === user.uid)
            .sort((a, b) =>
              (b.lastActivityAt ?? b.createdAt).localeCompare(
                a.lastActivityAt ?? a.createdAt
              )
            )
        )
      )
      .catch(() => setQuestions([]))
  }, [user])

  if (!loading && !user) {
    return (
      <EmptyState
        title="Sign in to see your questions"
        action={
          <Button asChild>
            <Link href="/auth?redirect=/my-forums">Sign in</Link>
          </Button>
        }
      />
    )
  }

  const remove = async (id: string) => {
    try {
      await deleteQuestion(await idToken(), id)
      setQuestions((list) => (list ?? []).filter((q) => q.id !== id))
      toast.success("Question deleted")
    } catch {
      toast.error("Could not delete the question")
    }
  }

  return (
    <section>
      <SectionHeader
        title="Your questions"
        meta={
          questions &&
          `${questions.length} ${questions.length === 1 ? "question" : "questions"}`
        }
      />
      {!questions ? (
        <Skeleton className="h-40 w-full" />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="You have not asked anything yet"
          action={
            <Button asChild>
              <Link href="/qna/ask">Ask a question</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <QuestionRow question={q} />
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete &quot;{q.title}&quot;?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        The question and its {q.replyCount}{" "}
                        {q.replyCount === 1 ? "answer" : "answers"} are removed
                        for everyone. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(q.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
