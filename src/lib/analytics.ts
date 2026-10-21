import { addWeeks, startOfWeek } from "date-fns"
import type { Comment, Question } from "@/lib/types"

export interface ForumAnalytics {
  generatedAt: string
  totals: {
    questions: number
    answers: number
    members: number
    questions30d: number
    questionsPrev30d: number
    activeMembers30d: number
  }
  answerRate: number | null // share of questions with an answer from someone else
  solvedRate: number | null // share of questions with an accepted answer
  medianFirstAnswerHours: number | null
  weekly: { week: string; questions: number; answers: number }[]
  firstAnswer: { bucket: string; count: number }[]
  topTags: { tag: string; count: number }[]
  byCommunity: { community: string; count: number }[]
  topContributors: {
    uid: string
    name: string
    answers: number
    accepted: number
    likes: number
  }[]
}

const DAY = 86_400_000
const HOUR = 3_600_000
const WEEKS = 12

const BUCKETS: [string, number][] = [
  ["Under 1 hour", 1],
  ["1 to 6 hours", 6],
  ["6 to 24 hours", 24],
  ["1 to 3 days", 72],
  ["Over 3 days", Infinity],
]

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const time = (iso: string) => new Date(iso).getTime()

// Everything the admin dashboard shows, from plain question and comment lists.
// An answer is a top-level comment that is not deleted. Self-answers do not
// count towards answer rate or time to first answer.
export function computeAnalytics(
  questions: Question[],
  comments: Comment[],
  members: { uid: string }[],
  communities: { id: string; name: string }[],
  now: Date
): ForumAnalytics {
  const nowMs = now.getTime()
  const answers = comments.filter((c) => !c.parentId && !c.deleted)
  const byQuestion = new Map(questions.map((q) => [q.id, q]))

  const firstAnswerAt = new Map<string, number>()
  for (const a of answers) {
    const q = byQuestion.get(a.questionId)
    if (!q || a.author.uid === q.author.uid) continue
    const at = time(a.createdAt)
    const prev = firstAnswerAt.get(q.id)
    if (prev === undefined || at < prev) firstAnswerAt.set(q.id, at)
  }

  const waits = questions
    .filter((q) => firstAnswerAt.has(q.id))
    .map(
      (q) => Math.max(0, firstAnswerAt.get(q.id)! - time(q.createdAt)) / HOUR
    )

  const firstAnswer = BUCKETS.map(([bucket]) => ({ bucket, count: 0 }))
  for (const hours of waits) {
    firstAnswer[BUCKETS.findIndex(([, max]) => hours < max)].count++
  }
  firstAnswer.push({
    bucket: "Not answered",
    count: questions.length - waits.length,
  })

  const firstWeek = startOfWeek(addWeeks(now, -(WEEKS - 1)), {
    weekStartsOn: 1,
  })
  const weekly = Array.from({ length: WEEKS }, (_, i) => ({
    week: addWeeks(firstWeek, i).toISOString(),
    questions: 0,
    answers: 0,
  }))
  const weekIndex = (iso: string) =>
    Math.floor((time(iso) - firstWeek.getTime()) / (7 * DAY))
  for (const q of questions) {
    const i = weekIndex(q.createdAt)
    if (i >= 0 && i < WEEKS) weekly[i].questions++
  }
  for (const a of answers) {
    const i = weekIndex(a.createdAt)
    if (i >= 0 && i < WEEKS) weekly[i].answers++
  }

  const tagCounts = new Map<string, number>()
  for (const q of questions)
    for (const t of q.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)

  const communityCounts = new Map<string, number>()
  for (const q of questions)
    communityCounts.set(
      q.communityId,
      (communityCounts.get(q.communityId) ?? 0) + 1
    )

  const contributors = new Map<
    string,
    ForumAnalytics["topContributors"][number]
  >()
  for (const a of answers) {
    const entry = contributors.get(a.author.uid) ?? {
      uid: a.author.uid,
      name: a.author.displayName ?? "Anonymous",
      answers: 0,
      accepted: 0,
      likes: 0,
    }
    entry.answers++
    entry.likes += a.upvotes
    if (byQuestion.get(a.questionId)?.acceptedAnswerId === a.id)
      entry.accepted++
    contributors.set(a.author.uid, entry)
  }

  const within = (iso: string, from: number, to: number) => {
    const t = time(iso)
    return t >= from && t < to
  }
  const recentStart = nowMs - 30 * DAY
  const active = new Set<string>()
  for (const q of questions)
    if (within(q.createdAt, recentStart, nowMs + 1)) active.add(q.author.uid)
  for (const c of comments)
    if (!c.deleted && within(c.createdAt, recentStart, nowMs + 1))
      active.add(c.author.uid)

  const rate = (n: number) => (questions.length ? n / questions.length : null)

  return {
    generatedAt: now.toISOString(),
    totals: {
      questions: questions.length,
      answers: answers.length,
      members: members.length,
      questions30d: questions.filter((q) =>
        within(q.createdAt, recentStart, nowMs + 1)
      ).length,
      questionsPrev30d: questions.filter((q) =>
        within(q.createdAt, recentStart - 30 * DAY, recentStart)
      ).length,
      activeMembers30d: active.size,
    },
    answerRate: rate(waits.length),
    solvedRate: rate(questions.filter((q) => q.acceptedAnswerId).length),
    medianFirstAnswerHours: median(waits),
    weekly,
    firstAnswer,
    topTags: [...tagCounts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count })),
    byCommunity: [...communityCounts]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        community: communities.find((c) => c.id === id)?.name ?? id,
        count,
      })),
    topContributors: [...contributors.values()]
      .sort(
        (a, b) =>
          b.accepted - a.accepted || b.answers - a.answers || b.likes - a.likes
      )
      .slice(0, 8),
  }
}
