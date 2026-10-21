import { describe, expect, it } from "vitest"
import { commentSort, docId, eventInput, questionInput } from "@/lib/schemas"
import { safeHttpUrl } from "@/lib/urls"

const question = {
  title: "How do I start with hackathons?",
  content: "Explain the step by step process please.",
  tags: ["Hackathon", "beginner"],
  communityId: "gdg",
}

describe("questionInput", () => {
  it("accepts a valid question and normalizes tags", () => {
    expect(questionInput.parse(question).tags).toEqual([
      "hackathon",
      "beginner",
    ])
  })

  it("rejects unknown communities, missing tags and short bodies", () => {
    expect(
      questionInput.safeParse({ ...question, communityId: "all" }).success
    ).toBe(false)
    expect(questionInput.safeParse({ ...question, tags: [] }).success).toBe(
      false
    )
    expect(questionInput.safeParse({ ...question, tags: ["!!"] }).success).toBe(
      false
    )
    expect(
      questionInput.safeParse({ ...question, content: "too short" }).success
    ).toBe(false)
  })
})

describe("docId", () => {
  it("never allows a path separator", () => {
    expect(docId.safeParse("abcDEF123_-").success).toBe(true)
    expect(docId.safeParse("a/b").success).toBe(false)
    expect(docId.safeParse("").success).toBe(false)
    expect(docId.safeParse("..").success).toBe(false)
  })
})

describe("eventInput", () => {
  const event = {
    title: "Intro to Git",
    description: "A hands-on workshop for first years.",
    posterImageUrl: "https://placehold.co/600x400.png",
    clubName: "GDG",
    communityId: "gdg",
    rsvpLink: "",
    dateTime: "2026-11-01T10:00:00.000Z",
  }

  it("accepts http(s) links and coerces the date", () => {
    const parsed = eventInput.parse(event)
    expect(parsed.dateTime).toBeInstanceOf(Date)
  })

  it("rejects script URLs", () => {
    expect(
      eventInput.safeParse({ ...event, rsvpLink: "javascript:alert(1)" })
        .success
    ).toBe(false)
    expect(
      eventInput.safeParse({ ...event, posterImageUrl: "data:text/html,x" })
        .success
    ).toBe(false)
  })
})

describe("commentSort", () => {
  it("falls back to newest for unknown values", () => {
    expect(commentSort.parse("top")).toBe("top")
    expect(commentSort.parse("drop table")).toBe("newest")
  })
})

describe("safeHttpUrl", () => {
  it("passes only http and https", () => {
    expect(safeHttpUrl("https://example.com/a")).toBe("https://example.com/a")
    expect(safeHttpUrl("javascript:alert(1)")).toBeUndefined()
    expect(safeHttpUrl("not a url")).toBeUndefined()
    expect(safeHttpUrl(undefined)).toBeUndefined()
  })
})
