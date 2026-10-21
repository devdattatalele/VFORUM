"use server"

import { adminDb } from "@/lib/firebase-admin"
import { toEvent, toQuestion } from "@/lib/server/docs"
import { COMMUNITIES } from "@/lib/constants"
import { excerpt } from "@/lib/markdown"
import { searchTerm as searchTermSchema } from "@/lib/schemas"

export interface SearchResult {
  type: "question" | "event" | "community"
  id: string
  title: string
  content: string
  url: string
  community?: string
  tags?: string[]
  metadata?: {
    author?: string | null
    upvotes?: number
    replyCount?: number
    createdAt?: string
    clubName?: string
    dateTime?: string
    rsvpCount?: number
  }
}

export interface SearchOptions {
  includeQuestions?: boolean
  includeEvents?: boolean
  includeCommunities?: boolean
  maxResults?: number
  communityId?: string
}

export async function searchAll(
  searchTerm: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    includeQuestions = true,
    includeEvents = true,
    includeCommunities = true,
    communityId,
  } = options
  const maxResults = Math.min(Math.max(Number(options.maxResults) || 20, 1), 50)

  const parsed = searchTermSchema.safeParse(searchTerm)
  if (!parsed.success || parsed.data.length < 2) return []
  const query = parsed.data.toLowerCase()
  const community =
    typeof communityId === "string" && communityId.length <= 64
      ? communityId
      : undefined

  try {
    const results: SearchResult[] = []
    if (includeQuestions) {
      results.push(
        ...(await searchQuestions(
          query,
          community,
          Math.ceil(maxResults * 0.6)
        ))
      )
    }
    if (includeEvents) {
      results.push(
        ...(await searchEvents(query, community, Math.ceil(maxResults * 0.3)))
      )
    }
    if (includeCommunities && !community) {
      results.push(...searchCommunities(query, Math.ceil(maxResults * 0.1)))
    }
    // Title matches first.
    return results
      .sort(
        (a, b) =>
          Number(b.title.toLowerCase().includes(query)) -
          Number(a.title.toLowerCase().includes(query))
      )
      .slice(0, maxResults)
  } catch (error) {
    console.error("Error during search:", error)
    return []
  }
}

// ponytail: substring match over the latest 50 questions; move to a real
// search index when the forum outgrows it (see research/future.md).
async function searchQuestions(
  query: string,
  communityId: string | undefined,
  limit: number
): Promise<SearchResult[]> {
  const base = adminDb.collection("questions")
  const snap = await (
    communityId ? base.where("communityId", "==", communityId) : base
  )
    .orderBy("createdAt", "desc")
    .limit(50)
    .get()

  return snap.docs
    .map((doc) => toQuestion(doc.id, doc.data()))
    .filter(
      (q) =>
        q.title.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query) ||
        q.tags.some((tag) => tag.toLowerCase().includes(query))
    )
    .slice(0, limit)
    .map((q) => ({
      type: "question" as const,
      id: q.id,
      title: q.title,
      content: excerpt(q.content),
      url: `/qna/${q.id}`,
      community: COMMUNITIES.find((c) => c.id === q.communityId)?.name,
      tags: q.tags,
      metadata: {
        author: q.author.displayName,
        upvotes: q.upvotes,
        replyCount: q.replyCount,
        createdAt: q.createdAt,
      },
    }))
}

async function searchEvents(
  query: string,
  communityId: string | undefined,
  limit: number
): Promise<SearchResult[]> {
  const base = adminDb.collection("events")
  const snap = await (
    communityId ? base.where("communityId", "==", communityId) : base
  )
    .orderBy("dateTime", "desc")
    .limit(30)
    .get()

  return snap.docs
    .map((doc) => toEvent(doc.id, doc.data()))
    .filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.clubName.toLowerCase().includes(query)
    )
    .slice(0, limit)
    .map((e) => ({
      type: "event" as const,
      id: e.id,
      title: e.title,
      content: excerpt(e.description),
      url: `/events/${e.id}`,
      community: COMMUNITIES.find((c) => c.id === e.communityId)?.name,
      metadata: {
        clubName: e.clubName,
        dateTime: e.dateTime,
        rsvpCount: e.rsvpCount,
      },
    }))
}

function searchCommunities(query: string, limit: number): SearchResult[] {
  return COMMUNITIES.filter(
    (c) =>
      c.id !== "all" &&
      (c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query))
  )
    .slice(0, limit)
    .map((c) => ({
      type: "community" as const,
      id: c.id,
      title: c.name,
      content: c.description || `Explore ${c.name} community`,
      url: `/community/${c.id}`,
    }))
}

// Autocomplete in the header search bar.
export async function quickSearch(
  searchTerm: string,
  maxResults: number = 8
): Promise<SearchResult[]> {
  return searchAll(searchTerm, { maxResults })
}
