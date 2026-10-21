// A Firebase ID token, the first argument of every server action that needs to
// know its caller. Branded so a uid or any other string cannot be passed by mistake.
export type IdToken = string & { readonly __brand: "IdToken" }

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role?: "user" | "moderator" | "admin"
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

// The author fields stored on content and sent to every visitor.
export type PublicAuthor = Pick<UserProfile, "uid" | "displayName" | "photoURL">

export interface Community {
  id: string
  name: string
  icon?: React.ElementType // Lucide icon component
  description?: string
}

export interface Event {
  id: string
  title: string
  description: string
  posterImageUrl: string
  dateTime: string // Store as ISO string, format on display
  clubName: string
  communityId: string // Link to Community
  rsvpCount?: number // Optional
  rsvpLink?: string // Optional external RSVP link
  author?: PublicAuthor
  createdAt?: string // ISO string
  // location?: string;
}

export interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  author: PublicAuthor
  createdAt: string // Store as ISO string
  updatedAt?: string // ISO string, for tracking edits
  upvotes: number
  downvotes: number
  communityId: string // Link to Community
  views: number
  replyCount: number
  lastActivityAt?: string // ISO string, for sorting or display
  acceptedAnswerId?: string | null // top-level comment the author marked as the answer
  pinned?: boolean // moderators keep it at the top of the forum
  locked?: boolean // moderators closed it to new answers
}

export interface Comment {
  id: string
  questionId: string
  parentId?: string | null // For threaded comments
  content: string
  author: PublicAuthor
  createdAt: string // Store as ISO string
  updatedAt?: string // ISO string, for tracking edits
  upvotes: number
  downvotes: number // Add downvotes field
  deleted?: boolean // removed by its author or a moderator; replies stay
}

export type NotificationType = "answer" | "comment" | "reply" | "accepted"

export interface AppNotification {
  id: string
  type: NotificationType
  questionId: string
  questionTitle: string
  commentId: string | null
  actor: PublicAuthor
  read: boolean
  createdAt: string
}

export type ReportReason = "spam" | "harassment" | "off-topic" | "other"

export interface Report {
  id: string
  questionId: string
  commentId: string | null
  questionTitle: string
  excerpt: string
  targetAuthor: PublicAuthor
  reason: ReportReason
  details: string
  reporter: PublicAuthor
  status: "open" | "dismissed" | "removed"
  createdAt: string
}

export interface AuditEntry {
  id: string
  actorEmail: string | null
  action: string
  target: string
  details: Record<string, unknown>
  createdAt: string
}

export interface Tag {
  name: string
  count?: number // Optional: for tag clouds or popular tags
}
