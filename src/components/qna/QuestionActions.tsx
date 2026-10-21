"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit3, Flag, Lock, MoreHorizontal, Pin, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ReportDialog from "@/components/qna/ReportDialog"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { idToken } from "@/lib/client-auth"
import {
  deleteQuestion,
  setQuestionFlags,
} from "@/lib/services/questionService"
import type { Question } from "@/lib/types"
import { canModerate, hasPermission } from "@/lib/utils/userUtils"

// Edit and delete for the author and moderators, pin and lock for
// moderators, report for everyone else who is signed in.
export default function QuestionActions({
  question,
  onEdit,
  onChange,
}: {
  question: Question
  onEdit: () => void
  onChange: (changes: Partial<Question>) => void
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [reporting, setReporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isModerator = hasPermission(user, "moderate_forums")
  const canManage = canModerate(user, question.author.uid)
  const canReport = !!user && user.uid !== question.author.uid
  if (!canManage && !canReport) return null

  const setFlags = async (flags: { pinned?: boolean; locked?: boolean }) => {
    try {
      await setQuestionFlags(await idToken(), question.id, flags)
      onChange(flags)
      toast.success(
        flags.pinned !== undefined
          ? flags.pinned
            ? "Pinned to the top of the forum"
            : "Unpinned"
          : flags.locked
            ? "Locked: new answers are closed"
            : "Unlocked"
      )
    } catch {
      toast.error("Could not update the question")
    }
  }

  const remove = async () => {
    try {
      await deleteQuestion(await idToken(), question.id)
      toast.success("Question deleted")
      router.push("/qna")
    } catch {
      toast.error("Could not delete the question")
    }
  }

  return (
    <div className="ml-4 flex shrink-0 items-center gap-2">
      {canManage && (
        <Button variant="outline" onClick={onEdit}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isModerator && (
            <>
              <DropdownMenuItem
                onSelect={() => setFlags({ pinned: !question.pinned })}
              >
                <Pin className="mr-2 h-4 w-4" />
                {question.pinned ? "Unpin" : "Pin to top"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setFlags({ locked: !question.locked })}
              >
                <Lock className="mr-2 h-4 w-4" />
                {question.locked ? "Unlock answers" : "Lock answers"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {canReport && (
            <DropdownMenuItem onSelect={() => setReporting(true)}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </DropdownMenuItem>
          )}
          {canManage && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete question
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        open={reporting}
        onOpenChange={setReporting}
        questionId={question.id}
        commentId={null}
      />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              The question and all of its answers are removed for everyone. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
