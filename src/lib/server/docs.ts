import "server-only"
import { FieldValue, type DocumentData } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { publicAuthor } from "@/lib/identity"
import { serialize } from "@/lib/serialize"
import { excerpt } from "@/lib/markdown"
import type {
  AppNotification,
  AuditEntry,
  Report,
  ReportReason,
  Comment,
  Event,
  NotificationType,
  PublicAuthor,
  Question,
  UserProfile,
} from "@/lib/types"
import { getPermissionsForRole } from "@/lib/utils/userUtils"

// Firestore documents become plain JSON here, field by field, so nothing a
// document happens to contain (emails in old author objects, Timestamps) leaves
// the server by accident.

const iso = (value: unknown, fallback?: string): string =>
  typeof value === "string" ? value : (fallback ?? new Date().toISOString())

const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0

export function toQuestion(
  id: string,
  raw: DocumentData | undefined
): Question {
  const d = serialize(raw ?? {})
  const createdAt = iso(d.createdAt)
  return {
    id,
    title: String(d.title ?? ""),
    content: String(d.content ?? ""),
    tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
    communityId: String(d.communityId ?? ""),
    author: publicAuthor(d.author),
    createdAt,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : undefined,
    lastActivityAt: iso(d.lastActivityAt, createdAt),
    upvotes: count(d.upvotes),
    downvotes: count(d.downvotes),
    views: count(d.views),
    replyCount: count(d.replyCount),
    acceptedAnswerId:
      typeof d.acceptedAnswerId === "string" ? d.acceptedAnswerId : null,
    pinned: d.pinned === true,
    locked: d.locked === true,
  }
}

export function toComment(
  id: string,
  questionId: string,
  raw: DocumentData | undefined
): Comment {
  const d = serialize(raw ?? {})
  return {
    id,
    questionId,
    parentId: typeof d.parentId === "string" ? d.parentId : null,
    content: d.deleted === true ? "" : String(d.content ?? ""),
    deleted: d.deleted === true,
    author: publicAuthor(d.author),
    createdAt: iso(d.createdAt),
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : undefined,
    upvotes: count(d.upvotes),
    downvotes: count(d.downvotes),
  }
}

export function toEvent(id: string, raw: DocumentData | undefined): Event {
  const d = serialize(raw ?? {})
  return {
    id,
    title: String(d.title ?? ""),
    description: String(d.description ?? ""),
    posterImageUrl: String(d.posterImageUrl ?? ""),
    dateTime: iso(d.dateTime),
    clubName: String(d.clubName ?? ""),
    communityId: String(d.communityId ?? ""),
    rsvpCount: count(d.rsvpCount),
    rsvpLink: typeof d.rsvpLink === "string" ? d.rsvpLink : undefined,
    author: d.author ? publicAuthor(d.author) : undefined,
    createdAt: iso(d.createdAt),
  }
}

export function toProfile(raw: DocumentData | undefined): UserProfile {
  const d = serialize(raw ?? {})
  const role: NonNullable<UserProfile["role"]> =
    d.role === "admin" || d.role === "moderator" ? d.role : "user"
  return {
    uid: String(d.uid ?? ""),
    email: typeof d.email === "string" ? d.email : null,
    displayName: typeof d.displayName === "string" ? d.displayName : null,
    photoURL: typeof d.photoURL === "string" ? d.photoURL : null,
    role,
    permissions: getPermissionsForRole(role),
    createdAt: typeof d.createdAt === "string" ? d.createdAt : undefined,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : undefined,
  }
}

export function toNotification(
  id: string,
  raw: DocumentData | undefined
): AppNotification {
  const d = serialize(raw ?? {})
  const type: NotificationType = [
    "answer",
    "comment",
    "reply",
    "accepted",
  ].includes(d.type)
    ? d.type
    : "answer"
  return {
    id,
    type,
    questionId: String(d.questionId ?? ""),
    questionTitle: String(d.questionTitle ?? ""),
    commentId: typeof d.commentId === "string" ? d.commentId : null,
    actor: publicAuthor(d.actor),
    read: d.read === true,
    createdAt: iso(d.createdAt),
  }
}

export function toReport(id: string, raw: DocumentData | undefined): Report {
  const d = serialize(raw ?? {})
  const reasons: ReportReason[] = ["spam", "harassment", "off-topic", "other"]
  return {
    id,
    questionId: String(d.questionId ?? ""),
    commentId: typeof d.commentId === "string" ? d.commentId : null,
    questionTitle: String(d.questionTitle ?? ""),
    excerpt: excerpt(String(d.excerpt ?? ""), 200),
    targetAuthor: publicAuthor(d.targetAuthor),
    reason: reasons.includes(d.reason) ? d.reason : "other",
    details: String(d.details ?? ""),
    reporter: publicAuthor(d.reporter),
    status:
      d.status === "dismissed" || d.status === "removed" ? d.status : "open",
    createdAt: iso(d.createdAt),
  }
}

export function toAuditEntry(
  id: string,
  raw: DocumentData | undefined
): AuditEntry {
  const d = serialize(raw ?? {})
  return {
    id,
    actorEmail: typeof d.actorEmail === "string" ? d.actorEmail : null,
    action: String(d.action ?? ""),
    target: String(d.target ?? ""),
    details:
      d.details && typeof d.details === "object" && !Array.isArray(d.details)
        ? d.details
        : {},
    createdAt: iso(d.createdAt),
  }
}

export const notificationsOf = (uid: string) =>
  adminDb.collection(`users/${uid}/notifications`)

export function notificationEntry(
  type: NotificationType,
  actor: PublicAuthor,
  question: { id: string; title: string },
  commentId: string | null
) {
  return {
    type,
    questionId: question.id,
    questionTitle: question.title,
    commentId,
    actor: {
      uid: actor.uid,
      displayName: actor.displayName,
      photoURL: actor.photoURL,
    },
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  }
}

// Privileged actions (role changes, moderators acting on other people's
// content) leave a record. Write it in the same transaction or batch as the
// change when there is one.
export const auditLog = () => adminDb.collection("audit_log")

export function auditEntry(
  actor: UserProfile,
  action: string,
  target: string,
  details: Record<string, unknown> = {}
) {
  return {
    actorUid: actor.uid,
    actorEmail: actor.email,
    action,
    target,
    details,
    createdAt: FieldValue.serverTimestamp(),
  }
}
