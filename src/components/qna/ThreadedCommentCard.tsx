"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle2,
  Flag,
  Link2,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import Markdown from "@/components/Markdown"
import CompactCommentForm from "@/components/qna/CompactCommentForm"
import ReportDialog from "@/components/qna/ReportDialog"
import SolvedBadge from "@/components/qna/SolvedBadge"
import VoteButtons from "@/components/qna/VoteButtons"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import { updateComment } from "@/lib/services/commentService"
import type { Comment } from "@/lib/types"
import { cn } from "@/lib/utils"
import { canModerate } from "@/lib/utils/userUtils"

const MAX_DEPTH = 6

// One answer or reply. Top-level answers are cards; replies hang off a rule.
export default function ThreadedCommentCard({
  comment,
  questionId,
  level = 0,
  onReply,
  onEdited,
  isAccepted = false,
  canAccept = false,
  onAccept,
  canReply = true,
  onDelete,
  children,
}: {
  comment: Comment
  questionId: string
  level?: number
  onReply: (content: string, parentId: string) => Promise<void>
  onEdited?: () => void
  isAccepted?: boolean
  canAccept?: boolean
  onAccept?: (commentId: string | null) => void
  canReply?: boolean
  onDelete?: (commentId: string) => void
  children?: React.ReactNode
}) {
  const { user } = useAuth()
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canManage = canModerate(user, comment.author.uid)
  const name = comment.author.displayName || "Anonymous"

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/qna/${questionId}#comment-${comment.id}`
      )
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  const saveEdit = async (content: string) => {
    await updateComment(await idToken(), questionId, comment.id, content)
    setEditing(false)
    toast.success("Comment updated")
    onEdited?.()
  }

  const action = "h-8 gap-1.5 px-2 text-muted-foreground"

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn("scroll-mt-24", level > 0 && "border-l pl-4")}
    >
      <div
        className={cn(
          level === 0 && "rounded-lg border bg-card p-4",
          isAccepted && "border-success/60"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author.photoURL ?? undefined} alt="" />
            <AvatarFallback className="bg-secondary text-[11px]">
              {comment.deleted ? "?" : name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {comment.deleted ? (
            <span className="text-muted-foreground">[deleted]</span>
          ) : (
            <Link
              href={`/u/${comment.author.uid}`}
              className="font-medium hover:underline"
            >
              {name}
            </Link>
          )}
          <span className="text-muted-foreground">
            ·{" "}
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
            {comment.updatedAt && !comment.deleted && " · edited"}
          </span>
          {isAccepted && <SolvedBadge label="Accepted answer" />}
        </div>

        {comment.deleted ? (
          <p className="mt-2 text-sm italic text-muted-foreground">
            This comment was deleted.
          </p>
        ) : editing ? (
          <CompactCommentForm
            startOpen
            initialContent={comment.content}
            submitLabel="Save"
            onSubmit={saveEdit}
            onCancel={() => setEditing(false)}
            className="mt-3"
          />
        ) : (
          <>
            <Markdown className="mt-2 text-[15px]">{comment.content}</Markdown>
            <div className="mt-2 flex flex-wrap items-center gap-0.5">
              <VoteButtons
                mode="like"
                id={comment.id}
                type="comment"
                questionId={questionId}
                initialUpvotes={comment.upvotes}
                initialDownvotes={comment.downvotes}
              />
              {user && canReply && level < MAX_DEPTH && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={action}
                  onClick={() => setReplying((v) => !v)}
                >
                  <MessageSquare className="h-4 w-4" /> Reply
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={action}
                onClick={share}
              >
                <Link2 className="h-4 w-4" /> Share
              </Button>
              {canAccept && onAccept && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(action, isAccepted && "text-success")}
                  onClick={() => onAccept(isAccepted ? null : comment.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isAccepted ? "Unaccept" : "Accept answer"}
                </Button>
              )}
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={action}
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              )}
              {canManage && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(action, "hover:text-destructive")}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
              {user && user.uid !== comment.author.uid && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={action}
                  onClick={() => setReporting(true)}
                >
                  <Flag className="h-4 w-4" /> Report
                </Button>
              )}
            </div>
          </>
        )}

        {replying && (
          <CompactCommentForm
            startOpen
            placeholder={`Reply to ${name}`}
            submitLabel="Reply"
            onSubmit={async (content) => {
              await onReply(content, comment.id)
              setReplying(false)
            }}
            onCancel={() => setReplying(false)}
            className="mt-3"
          />
        )}
      </div>

      {children && (
        <div className="mt-3 space-y-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {collapsed ? "Show replies" : "Hide replies"}
          </button>
          {!collapsed && children}
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
