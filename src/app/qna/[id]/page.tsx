"use client"

import { useParams, useRouter } from "next/navigation"
import type { Question, Comment as CommentType } from "@/lib/types"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import VoteButtons from "@/components/qna/VoteButtons"
import ThreadedCommentCard from "@/components/qna/ThreadedCommentCard"
import CompactCommentForm from "@/components/qna/CompactCommentForm"
import CommentSort from "@/components/qna/CommentSort"
import CommentSearch from "@/components/qna/CommentSearch"
import ScrollProgress from "@/components/ui/ScrollProgress"
import QuestionEditForm from "@/components/qna/QuestionEditForm"
import {
  CalendarDays,
  Tag as TagIcon,
  UserCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Eye,
  Edit3,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import React, { useEffect, useState, useMemo } from "react"
import {
  acceptAnswer,
  getQuestionById,
  updateQuestion,
} from "@/lib/services/questionService"
import { getThreadedComments, addComment } from "@/lib/services/commentService"
import { COMMUNITIES } from "@/lib/constants"
import { idToken } from "@/lib/client-auth"
import Markdown from "@/components/Markdown"
import SolvedBadge from "@/components/qna/SolvedBadge"
import { canModerate } from "@/lib/utils/userUtils"

// Helper function to build comment tree
function buildCommentTree(comments: CommentType[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>()
  const topLevelComments: CommentWithReplies[] = []

  // First pass: create all comment objects
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build the tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      } else {
        // Parent not found, treat as top-level
        topLevelComments.push(commentWithReplies)
      }
    } else {
      topLevelComments.push(commentWithReplies)
    }
  })

  return topLevelComments
}

interface CommentWithReplies extends CommentType {
  replies: CommentWithReplies[]
}

function ThreadedCommentTree({
  comment,
  questionId,
  level = 0,
  onReply,
  onEdit,
  acceptedId,
  canAccept,
  onAccept,
}: {
  comment: CommentWithReplies
  questionId: string
  level?: number
  onReply: (content: string, parentId: string) => Promise<void>
  onEdit: () => void
  acceptedId?: string | null
  canAccept?: boolean
  onAccept?: (commentId: string | null) => void
}) {
  return (
    <ThreadedCommentCard
      comment={comment}
      questionId={questionId}
      level={level}
      onReply={onReply}
      onEdit={onEdit}
      isAccepted={level === 0 && comment.id === acceptedId}
      canAccept={level === 0 && canAccept}
      onAccept={onAccept}
    >
      {comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <ThreadedCommentTree
              key={reply.id}
              comment={reply}
              questionId={questionId}
              level={level + 1}
              onReply={onReply}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </ThreadedCommentCard>
  )
}

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const questionId = params.id as string

  const [question, setQuestion] = useState<Question | null | undefined>(
    undefined
  )
  const [comments, setComments] = useState<CommentType[]>([])
  const [commentSort, setCommentSort] = useState("top")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditQuestion, setShowEditQuestion] = useState(false)

  const community = question
    ? COMMUNITIES.find((c) => c.id === question.communityId)
    : null

  // Scroll sections for smart scrollbar
  const scrollSections = [
    { name: "Question", id: "question-section" },
    { name: "Comments", id: "comments-section" },
  ]

  useEffect(() => {
    if (questionId) {
      setIsLoading(true)
      setError(null)
      Promise.all([
        getQuestionById(questionId),
        getThreadedComments(questionId, commentSort),
      ])
        .then(([fetchedQuestion, fetchedComments]) => {
          setQuestion(fetchedQuestion || null)
          setComments(fetchedComments || [])
        })
        .catch((err) => {
          console.error("Error fetching question details:", err)
          setError("Could not load the question or comments.")
          setQuestion(null)
          setComments([])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [questionId, commentSort])

  // Links from notifications point at #comment-<id>; the comments load after
  // navigation, so scroll once they are on the page.
  useEffect(() => {
    if (isLoading) return
    const target = window.location.hash.slice(1)
    if (target) {
      document
        .getElementById(target)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isLoading])

  const handleCommentSubmit = async (
    content: string,
    parentId?: string | null
  ) => {
    if (!user || !question) {
      return
    }
    try {
      await addComment(await idToken(), question.id, { content, parentId })

      // Refresh comments to get updated threaded structure
      const updatedComments = await getThreadedComments(questionId, commentSort)
      setComments(updatedComments)
    } catch (err) {
      console.error("Failed to submit comment:", err)
    }
  }

  const handleEditComment = async () => {
    // Refresh comments after edit
    try {
      const updatedComments = await getThreadedComments(questionId, commentSort)
      setComments(updatedComments)
    } catch (err) {
      console.error("Failed to refresh comments:", err)
    }
  }

  const handleSortChange = (newSort: string) => {
    setCommentSort(newSort)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleShareQuestion = async () => {
    try {
      const url = `${window.location.origin}/qna/${questionId}`
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Question link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditQuestion = () => {
    setShowEditQuestion(true)
  }

  const handleQuestionUpdate = async (updates: {
    title: string
    content: string
    tags: string[]
  }) => {
    if (!user || !question) return

    try {
      await updateQuestion(await idToken(), question.id, updates)
      setShowEditQuestion(false)

      // Refresh question data
      const updatedQuestion = await getQuestionById(questionId)
      setQuestion(updatedQuestion)

      toast({
        title: "Question updated",
        description: "Your question has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating question:", error)
      toast({
        title: "Update failed",
        description: "Unable to update question. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAccept = async (commentId: string | null) => {
    if (!question) return
    try {
      await acceptAnswer(await idToken(), question.id, commentId)
      setQuestion({ ...question, acceptedAnswerId: commentId })
      toast({
        title: commentId ? "Answer accepted" : "Accepted answer cleared",
        description: commentId
          ? "It now shows first, marked as the answer."
          : undefined,
      })
    } catch (error) {
      console.error("Error accepting answer:", error)
      toast({
        title: "Could not update the accepted answer",
        variant: "destructive",
      })
    }
  }

  // Filter comments based on search query
  const filteredComments = useMemo(() => {
    if (!searchQuery.trim()) return comments

    const query = searchQuery.toLowerCase()
    return comments.filter(
      (comment) =>
        comment.content.toLowerCase().includes(query) ||
        comment.author.displayName?.toLowerCase().includes(query)
    )
  }, [comments, searchQuery])

  // Build comment tree from filtered comments
  // The accepted answer leads; the rest keep the chosen sort.
  const acceptedId = question?.acceptedAnswerId ?? null
  const commentTree = useMemo(() => {
    const tree = buildCommentTree(filteredComments)
    if (!acceptedId) return tree
    return [...tree].sort(
      (a, b) => Number(b.id === acceptedId) - Number(a.id === acceptedId)
    )
  }, [filteredComments, acceptedId])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Question Not Found</h2>
          <p className="text-muted-foreground">
            {error ||
              "The question you're looking for doesn't exist or has been removed."}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <>
      <ScrollProgress sections={scrollSections} />

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6 px-6 py-3 text-base"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>

        {/* Question Card */}
        <Card className="glass-card shadow-lg" id="question-section">
          {showEditQuestion ? (
            <CardContent className="p-0">
              <QuestionEditForm
                initialData={{
                  title: question.title,
                  content: question.content,
                  tags: question.tags || [],
                }}
                onSubmit={handleQuestionUpdate}
                onCancel={() => setShowEditQuestion(false)}
              />
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex-1 font-headline text-4xl leading-tight">
                    {question.title}
                    {question.acceptedAnswerId && (
                      <SolvedBadge className="ml-3 align-middle text-sm" />
                    )}
                  </CardTitle>
                  {canModerate(user, question.author.uid) && (
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleEditQuestion}
                      className="ml-4"
                    >
                      <Edit3 className="mr-2 h-5 w-5" />
                      Edit
                    </Button>
                  )}
                </div>

                <div className="mt-4 flex items-center space-x-3 text-base text-muted-foreground">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={question.author.photoURL || undefined}
                      alt={question.author.displayName || "Author"}
                    />
                    <AvatarFallback className="text-sm">
                      {question.author.displayName ? (
                        question.author.displayName.charAt(0).toUpperCase()
                      ) : (
                        <UserCircle size={16} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {question.author.displayName || "Anonymous"}
                  </span>
                  <span className="text-muted-foreground/50">&bull;</span>
                  <CalendarDays className="h-5 w-5" />
                  <span>
                    Asked{" "}
                    {formatDistanceToNow(new Date(question.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-muted-foreground/50">&bull;</span>
                  <Eye className="h-5 w-5" />
                  <span>{question.views || 0} views</span>
                  {community && (
                    <Badge
                      variant="community"
                      className="ml-auto px-3 py-1 text-sm"
                    >
                      {community.name}
                    </Badge>
                  )}
                </div>
                {question.tags && question.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {question.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        <TagIcon className="mr-1 h-4 w-4" /> {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pb-6">
                <Markdown className="text-lg leading-relaxed text-foreground/90">
                  {question.content}
                </Markdown>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-6">
                <VoteButtons
                  initialUpvotes={question.upvotes}
                  initialDownvotes={question.downvotes}
                  id={question.id}
                  type="question"
                  orientation="horizontal"
                  size="default"
                  mode="upvote"
                  showShare={true}
                  onShare={handleShareQuestion}
                />
              </CardFooter>
            </>
          )}
        </Card>

        {/* Comments Section */}
        <div className="space-y-6" id="comments-section">
          <div className="flex items-center justify-between gap-4 border-b border-border/50 py-4">
            <CommentSort
              currentSort={commentSort}
              onSortChange={handleSortChange}
              commentCount={comments.length}
            />
            <CommentSearch
              onSearch={handleSearch}
              placeholder="Search comments..."
            />
          </div>

          <div className="px-2">
            <CompactCommentForm
              questionId={question.id}
              onSubmit={(content) => handleCommentSubmit(content, null)}
              placeholder="Add a comment..."
            />
          </div>

          {/* Threaded Comments */}
          <div className="space-y-4">
            {commentTree.length > 0 ? (
              commentTree.map((comment) => (
                <ThreadedCommentTree
                  key={comment.id}
                  comment={comment}
                  questionId={question.id}
                  onReply={handleCommentSubmit}
                  onEdit={handleEditComment}
                  acceptedId={acceptedId}
                  canAccept={canModerate(user, question.author.uid)}
                  onAccept={handleAccept}
                />
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg">
                  {searchQuery
                    ? "No comments match your search."
                    : "No comments yet. Be the first to share your thoughts!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
