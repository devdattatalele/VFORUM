import { z } from "zod"
import { COMMUNITIES } from "@/lib/constants"
import { MAX_TAGS, normalizeTags } from "@/lib/tags"
import { safeHttpUrl } from "@/lib/urls"

// Inputs to every server action are parsed here. Server actions are public
// HTTP endpoints, so the browser's own validation counts for nothing.

// Firestore ids; no "/" so an id can never address a different path.
export const docId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/, "Invalid id")

const communityIds = COMMUNITIES.map((c) => c.id).filter((id) => id !== "all")
export const communityId = z
  .string()
  .refine((id) => communityIds.includes(id), "Unknown community")

const tags = z
  .array(z.string().max(100))
  .max(20)
  .transform(normalizeTags)
  .pipe(
    z
      .array(z.string())
      .min(1, "Add at least one tag.")
      .max(MAX_TAGS, `At most ${MAX_TAGS} tags.`)
  )

const title = z.string().trim().min(10).max(200)
// Markdown with code blocks needs room.
const body = z.string().trim().min(20).max(10000)

export const questionInput = z.object({
  title,
  content: body,
  tags,
  communityId,
})

export const questionUpdate = z.object({ title, content: body, tags })

export const commentInput = z.object({
  content: z.string().trim().min(1).max(5000),
  parentId: docId.nullish(),
})

export const commentContent = commentInput.shape.content

export const commentSort = z
  .enum(["newest", "oldest", "top", "controversial"])
  .catch("newest")

export const voteType = z.enum(["up", "down", "none"])

export const role = z.enum(["user", "moderator", "admin"])

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((url) => safeHttpUrl(url) !== undefined, "Use an http or https link.")

export const eventInput = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(1000),
  posterImageUrl: httpUrl,
  clubName: z.string().trim().min(2).max(80),
  communityId,
  rsvpLink: z.union([httpUrl, z.literal("")]).optional(),
  dateTime: z.coerce.date(),
})

export const searchTerm = z.string().trim().max(200)
