"use client"

import type { Question } from "@/lib/types"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  HelpCircle,
  Loader2,
  ArrowUp,
  Trash2,
  Edit3,
  PlusCircle,
  AlertTriangle,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { getQuestions, deleteQuestion } from "@/lib/services/questionService"
import { COMMUNITIES } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
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
import { toast } from "sonner"

export default function MyForumsList() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMyQuestions() {
      if (!user) return

      setIsLoading(true)
      setError(null)
      try {
        const fetchedQuestions = await getQuestions()
        // Filter to only show user's questions
        const myQuestions = fetchedQuestions.filter(
          (q) => q.author.uid === user.uid
        )
        setQuestions(myQuestions)
      } catch (err) {
        console.error("Failed to fetch questions:", err)
        setError("Could not load your forums. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyQuestions()
  }, [user])

  const filteredQuestions = React.useMemo(() => {
    let processedQuestions = questions

    if (searchTerm) {
      processedQuestions = processedQuestions.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    }

    // Sort by most recent activity first
    return processedQuestions.sort((a, b) => {
      const aActivity = a.lastActivityAt || a.createdAt
      const bActivity = b.lastActivityAt || b.createdAt
      return new Date(bActivity).getTime() - new Date(aActivity).getTime()
    })
  }, [questions, searchTerm])

  const handleDeleteQuestion = async (questionId: string) => {
    setDeletingId(questionId)
    try {
      await deleteQuestion(questionId)
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      toast.success("Forum post deleted successfully!")
    } catch (error) {
      console.error("Failed to delete question:", error)
      toast.error("Failed to delete forum post. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your forums...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 text-center text-destructive">
        <HelpCircle className="mx-auto mb-4 h-12 w-12" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-[calc(var(--header-height,64px)+1rem)] z-30 flex flex-col items-center justify-between gap-4 rounded-lg border-b border-border bg-background/80 p-4 dark:bg-background/50 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your forums..."
            className="bg-background/70 pl-10 focus:bg-background dark:bg-background/70 dark:focus:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            <Link href="/qna/ask">
              <PlusCircle className="mr-2 h-4 w-4" /> Ask New Question
            </Link>
          </Button>
        </div>
      </div>

      {filteredQuestions.length > 0 ? (
        <Table className="mt-0">
          <TableHeader>
            <TableRow className="border-b-border hover:bg-transparent">
              <TableHead className="w-[45%] font-semibold text-muted-foreground">
                Topic
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Upvotes
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Replies
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Views
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Activity
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => {
              const community = COMMUNITIES.find(
                (c) => c.id === question.communityId
              )
              return (
                <TableRow
                  key={question.id}
                  className="border-b-border hover:bg-muted/30 dark:hover:bg-muted/10"
                >
                  <TableCell className="py-3 align-top">
                    <Link href={`/qna/${question.id}`} className="group block">
                      <h3 className="mb-1 line-clamp-2 text-base font-medium text-foreground transition-colors group-hover:text-primary">
                        {question.title}
                      </h3>
                    </Link>
                    <div className="mb-1.5 flex items-center space-x-2 text-xs text-muted-foreground">
                      {community && (
                        <Badge variant="community" className="px-1.5 py-0.5">
                          {community.icon && (
                            <community.icon className="mr-1 h-3 w-3" />
                          )}
                          {community.name}
                        </Badge>
                      )}
                      {question.tags.slice(0, 2).map((tag) => (
                        <Link
                          key={tag}
                          href={`/qna?tag=${encodeURIComponent(tag)}`}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer px-1.5 py-0.5 transition-colors hover:bg-primary/20"
                          >
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {question.content.substring(0, 100)}
                      {question.content.length > 100 ? "..." : ""}
                    </p>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {question.upvotes || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle text-sm tabular-nums text-foreground">
                    {question.replyCount || 0}
                  </TableCell>
                  <TableCell className="text-center align-middle text-sm tabular-nums text-foreground">
                    {Intl.NumberFormat("en", { notation: "compact" }).format(
                      question.views || 0
                    )}
                  </TableCell>
                  <TableCell className="text-center align-middle text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-center">
                        <div>
                          {formatDistanceToNow(
                            new Date(
                              question.lastActivityAt || question.createdAt
                            ),
                            { addSuffix: true }
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <Link href={`/qna/${question.id}`}>
                          <Edit3 className="h-3 w-3" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={deletingId === question.id}
                          >
                            {deletingId === question.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Delete Forum Post
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              <strong>{question.title}</strong>&quot;? This
                              action cannot be undone and will remove all
                              replies and discussions associated with this post.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Post
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="mt-8 rounded-lg border border-white/10 bg-card/80 py-16 text-center shadow-sm backdrop-blur-md">
          <HelpCircle className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-2xl font-semibold text-foreground">
            No Forums Posted Yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {searchTerm
              ? "No forums match your search criteria. Try a different search term."
              : "You haven't posted any questions yet. Start a discussion by asking your first question!"}
          </p>
          {!searchTerm && (
            <Button
              asChild
              className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/qna/ask">
                <PlusCircle className="mr-2 h-4 w-4" /> Ask Your First Question
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
