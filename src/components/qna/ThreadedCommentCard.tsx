"use client"

import React, { useState } from "react"
import type { Comment as CommentType } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import VoteButtons from "./VoteButtons"
import CompactCommentForm from "./CompactCommentForm"
import {
  UserCircle,
  CalendarDays,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Share,
  Edit3,
  CheckCircle2,
  Flag,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { updateComment } from "@/lib/services/commentService"
import { idToken } from "@/lib/client-auth"
import Markdown from "@/components/Markdown"
import SolvedBadge from "@/components/qna/SolvedBadge"
import { canModerate } from "@/lib/utils/userUtils"
import ReportDialog from "@/components/qna/ReportDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface ThreadedCommentCardProps {
  comment: CommentType
  questionId: string
  level?: number
  onReply: (content: string, parentId: string) => Promise<void>
  onEdit?: () => void // Callback to refresh comments after edit
  children?: React.ReactNode // For nested replies
  isAccepted?: boolean
  canAccept?: boolean // the viewer may mark this top-level answer as accepted
  onAccept?: (commentId: string | null) => void
  canReply?: boolean // false on locked questions, except for moderators
  onDelete?: (commentId: string) => void
}

export default function ThreadedCommentCard({
  comment,
  questionId,
  level = 0,
  onReply,
  onEdit,
  children,
  isAccepted = false,
  canAccept = false,
  onAccept,
  canReply = true,
  onDelete,
}: ThreadedCommentCardProps) {
  const [reporting, setReporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const maxLevel = 8 // Maximum nesting level
  const isMaxLevel = level >= maxLevel

  const handleReply = async (content: string) => {
    await onReply(content, comment.id)
    setShowReplyForm(false)
  }

  const handleCancel = () => {
    setShowReplyForm(false)
    setShowEditForm(false)
  }

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/qna/${questionId}#comment-${comment.id}`
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Comment link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => {
    setShowEditForm(true)
    setShowReplyForm(false)
  }

  const handleEditSubmit = async (content: string) => {
    if (!user) return

    try {
      await updateComment(await idToken(), questionId, comment.id, content)
      setShowEditForm(false)
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      })

      // Call the onEdit callback to refresh comments
      if (onEdit) {
        onEdit()
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Update failed",
        description: "Unable to update comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const CollapseButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-muted/50"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isCollapsed ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronUp className="h-3 w-3" />
      )}
    </Button>
  )

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn(
        "relative",
        level > 0 && "ml-10", // Increased indentation
        isCollapsed && "opacity-60"
      )}
    >
      {/* Threading line for nested comments */}
      {level > 0 && (
        <div className="absolute bottom-0 left-[-20px] top-0 w-[2px] bg-border/30" />
      )}

      <div
        className={cn(
          "group relative rounded-lg bg-background/50 p-4 transition-colors hover:bg-muted/30", // Increased padding
          level === 0 && "border border-border/50 shadow-sm",
          isAccepted && "border-green-500/60 bg-green-500/5"
        )}
      >
        <div className="flex gap-3">
          {" "}
          {/* Increased gap */}
          {/* Collapse button for threads with replies */}
          <div className="flex flex-col items-center pt-1">
            {children && <CollapseButton />}
            <Avatar className="mt-1 h-8 w-8">
              {" "}
              {/* Increased avatar size */}
              <AvatarImage
                src={comment.author.photoURL || undefined}
                alt={comment.author.displayName || "Author"}
              />
              <AvatarFallback className="text-sm">
                {comment.author.displayName ? (
                  comment.author.displayName.charAt(0).toUpperCase()
                ) : (
                  <UserCircle size={14} />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            {/* Comment header */}
            <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
              {" "}
              {/* Increased gaps and margin */}
              {comment.deleted ? (
                <span className="text-base font-medium text-muted-foreground">
                  [deleted]
                </span>
              ) : (
                <Link
                  href={`/u/${comment.author.uid}`}
                  className="text-base font-medium text-foreground hover:text-primary hover:underline"
                >
                  {comment.author.displayName || "Anonymous"}
                </Link>
              )}
              <span className="opacity-70">•</span>
              <CalendarDays className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {isAccepted && <SolvedBadge label="Accepted answer" />}
            </div>

            {!isCollapsed && comment.deleted && (
              <p className="mb-2 text-sm italic text-muted-foreground">
                This comment was deleted.
              </p>
            )}

            {/* Comment content */}
            {!isCollapsed && !comment.deleted && (
              <>
                <Markdown className="mb-4 text-base leading-relaxed text-foreground/90">
                  {comment.content}
                </Markdown>

                {/* Comment actions */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <VoteButtons
                    initialUpvotes={comment.upvotes || 0}
                    initialDownvotes={comment.downvotes || 0}
                    id={comment.id}
                    type="comment"
                    questionId={questionId}
                    orientation="horizontal"
                    size="sm"
                    mode="like"
                  />
                  {user && !isMaxLevel && canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-sm hover:bg-muted" // Increased height and padding
                      onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Reply
                    </Button>
                  )}
                  {/* Share button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-sm hover:bg-muted" // Increased height and padding
                    onClick={handleShare}
                  >
                    <Share className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                  {/* Edit button for comment author */}
                  {canAccept && onAccept && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-sm hover:bg-muted",
                        isAccepted && "text-green-700 dark:text-green-400"
                      )}
                      onClick={() => onAccept(isAccepted ? null : comment.id)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      {isAccepted ? "Unaccept" : "Accept answer"}
                    </Button>
                  )}
                  {canModerate(user, comment.author.uid) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-sm hover:bg-muted" // Increased height and padding
                      onClick={handleEdit}
                    >
                      <Edit3 className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {onDelete && canModerate(user, comment.author.uid) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  {user && user.uid !== comment.author.uid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-sm text-muted-foreground hover:bg-muted"
                      onClick={() => setReporting(true)}
                    >
                      <Flag className="mr-1 h-4 w-4" />
                      Report
                    </Button>
                  )}
                </div>

                {/* Reply form */}
                {showReplyForm && (
                  <div className="mt-4 border-l-2 border-primary/30 pl-4">
                    {" "}
                    {/* Increased margins and padding */}
                    <CompactCommentForm
                      questionId={questionId}
                      parentId={comment.id}
                      onSubmit={handleReply}
                      onCancel={handleCancel}
                      placeholder={`Reply to ${comment.author.displayName || "this comment"}...`}
                    />
                  </div>
                )}

                {/* Edit form */}
                {showEditForm && (
                  <div className="mt-4 border-l-2 border-orange-500/30 pl-4">
                    {" "}
                    {/* Increased margins and padding */}
                    <CompactCommentForm
                      questionId={questionId}
                      parentId={null}
                      onSubmit={handleEditSubmit}
                      onCancel={handleCancel}
                      placeholder="Edit your comment..."
                      initialContent={comment.content}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {!isCollapsed && children && (
        <div className="mt-3">
          {" "}
          {/* Increased margin */}
          {children}
        </div>
      )}
      <ReportDialog
        open={reporting}
        onOpenChange={setReporting}
        questionId={questionId}
        commentId={comment.id}
      />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Its text is removed for everyone. Replies to it stay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete?.(comment.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
