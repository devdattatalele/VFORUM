import type { NotificationType } from "@/lib/types"

// Who hears about a new comment: the author of the comment being replied to,
// and the asker. One notification per person, and never the commenter.
export function commentRecipients({
  actorUid,
  questionAuthorUid,
  parentAuthorUid,
}: {
  actorUid: string
  questionAuthorUid?: string | null
  parentAuthorUid?: string | null
}): { uid: string; type: NotificationType }[] {
  const recipients = new Map<string, NotificationType>()
  if (parentAuthorUid && parentAuthorUid !== actorUid) {
    recipients.set(parentAuthorUid, "reply")
  }
  if (
    questionAuthorUid &&
    questionAuthorUid !== actorUid &&
    !recipients.has(questionAuthorUid)
  ) {
    recipients.set(questionAuthorUid, parentAuthorUid ? "comment" : "answer")
  }
  return [...recipients].map(([uid, type]) => ({ uid, type }))
}

export const NOTIFICATION_TEXT: Record<NotificationType, string> = {
  answer: "answered your question",
  comment: "commented on your question",
  reply: "replied to you on",
  accepted: "accepted your answer on",
}
