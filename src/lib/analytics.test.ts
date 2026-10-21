import { describe, expect, it } from "vitest"
import { computeAnalytics, median } from "@/lib/analytics"
import type { Comment, Question } from "@/lib/types"

const now = new Date("2026-10-21T12:00:00.000Z")
const hoursAgo = (h: number) =>
  new Date(now.getTime() - h * 3_600_000).toISOString()
const author = (uid: string) => ({
  uid,
  displayName: uid.toUpperCase(),
  photoURL: null,
})

const question = (
  id: string,
  by: string,
  createdHoursAgo: number,
  extra: Partial<Question> = {}
): Question => ({
  id,
  title: id,
  content: "",
  tags: [],
  communityId: "gdg",
  author: author(by),
  createdAt: hoursAgo(createdHoursAgo),
  upvotes: 0,
  downvotes: 0,
  views: 0,
  replyCount: 0,
  ...extra,
})

const comment = (
  id: string,
  questionId: string,
  by: string,
  createdHoursAgo: number,
  extra: Partial<Comment> = {}
): Comment => ({
  id,
  questionId,
  parentId: null,
  content: "",
  author: author(by),
  createdAt: hoursAgo(createdHoursAgo),
  upvotes: 0,
  downvotes: 0,
  ...extra,
})

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([5, 1, 3])).toBe(3)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBeNull()
  })
})

describe("computeAnalytics", () => {
  const questions = [
    question("q1", "asker", 10, {
      tags: ["react", "js"],
      acceptedAnswerId: "a1",
    }),
    question("q2", "asker", 100, { tags: ["react"], communityId: "acm" }),
    question("q3", "other", 5),
  ]
  const comments = [
    comment("a1", "q1", "helper", 9, { upvotes: 3 }), // 1 hour after asking
    comment("r1", "q1", "asker", 8, { parentId: "a1" }), // a reply, not an answer
    comment("a2", "q2", "helper", 40), // 60 hours after asking
    comment("self", "q3", "other", 4), // self-answer does not count
    comment("gone", "q3", "helper", 3, { deleted: true }),
  ]
  const result = computeAnalytics(
    questions,
    comments,
    [{ uid: "asker" }, { uid: "other" }, { uid: "helper" }],
    [
      { id: "gdg", name: "GDG" },
      { id: "acm", name: "ACM" },
    ],
    now
  )

  it("counts answers, rates and the median wait, ignoring replies, self-answers and deleted answers", () => {
    expect(result.totals.answers).toBe(3)
    expect(result.answerRate).toBeCloseTo(2 / 3)
    expect(result.solvedRate).toBeCloseTo(1 / 3)
    expect(result.medianFirstAnswerHours).toBe(30.5)
  })

  it("buckets time to first answer and keeps the unanswered", () => {
    const counts = Object.fromEntries(
      result.firstAnswer.map((b) => [b.bucket, b.count])
    )
    expect(counts["1 to 6 hours"]).toBe(1)
    expect(counts["1 to 3 days"]).toBe(1)
    expect(counts["Not answered"]).toBe(1)
  })

  it("puts recent activity in the last of twelve weeks", () => {
    expect(result.weekly).toHaveLength(12)
    const total = result.weekly.reduce((n, w) => n + w.questions, 0)
    expect(total).toBe(3)
    expect(result.weekly.at(-1)!.answers).toBeGreaterThan(0)
  })

  it("ranks tags, communities and contributors", () => {
    expect(result.topTags[0]).toEqual({ tag: "react", count: 2 })
    expect(result.byCommunity).toEqual([
      { community: "GDG", count: 2 },
      { community: "ACM", count: 1 },
    ])
    expect(result.topContributors[0]).toMatchObject({
      uid: "helper",
      answers: 2,
      accepted: 1,
      likes: 3,
    })
    expect(result.totals.activeMembers30d).toBe(3)
  })
})
