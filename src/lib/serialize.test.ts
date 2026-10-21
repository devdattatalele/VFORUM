import { describe, expect, it } from "vitest"
import { Timestamp } from "firebase-admin/firestore"
import { serialize } from "@/lib/serialize"

describe("serialize", () => {
  it("turns Firestore Timestamps at any depth into ISO strings", () => {
    const t = Timestamp.fromDate(new Date("2026-01-02T03:04:05.000Z"))
    const out = serialize({
      updatedAt: t,
      author: { createdAt: t },
      list: [{ at: t }],
    })
    expect(out.updatedAt).toBe("2026-01-02T03:04:05.000Z")
    expect(out.author.createdAt).toBe("2026-01-02T03:04:05.000Z")
    expect(out.list[0].at).toBe("2026-01-02T03:04:05.000Z")
  })

  it("leaves plain JSON untouched", () => {
    const value = {
      id: "q1",
      tags: ["x"],
      n: 1,
      nil: null,
      nested: { ok: true },
    }
    expect(serialize(value)).toEqual(value)
    expect(JSON.parse(JSON.stringify(serialize(value)))).toEqual(value)
  })
})
