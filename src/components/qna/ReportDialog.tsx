"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { idToken } from "@/lib/client-auth"
import { reportContent } from "@/lib/services/moderationService"
import type { ReportReason } from "@/lib/types"

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "off-topic", label: "Off-topic or not a real question" },
  { value: "other", label: "Something else" },
]

export default function ReportDialog({
  open,
  onOpenChange,
  questionId,
  commentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionId: string
  commentId: string | null
}) {
  const { toast } = useToast()
  const [reason, setReason] = useState<ReportReason>("spam")
  const [details, setDetails] = useState("")
  const [sending, setSending] = useState(false)

  const submit = async () => {
    setSending(true)
    try {
      await reportContent(await idToken(), {
        questionId,
        commentId,
        reason,
        details,
      })
      toast({ title: "Reported", description: "Moderators will take a look." })
      setDetails("")
      onOpenChange(false)
    } catch {
      toast({ title: "Could not send the report", variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Report this {commentId ? "comment" : "question"}
          </DialogTitle>
          <DialogDescription>
            Moderators review every report. The author is not told who reported
            it.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={reason}
          onValueChange={(value) => setReason(value as ReportReason)}
        >
          {REASONS.map((r) => (
            <div key={r.value} className="flex items-center gap-2">
              <RadioGroupItem id={`reason-${r.value}`} value={r.value} />
              <Label htmlFor={`reason-${r.value}`}>{r.label}</Label>
            </div>
          ))}
        </RadioGroup>
        <Textarea
          placeholder="Anything moderators should know (optional)"
          maxLength={500}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={sending}>
            Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
