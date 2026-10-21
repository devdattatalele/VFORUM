import { describe, expect, it } from "vitest"
import { buildTree } from "@/lib/thread"
import type { Comment } from "@/lib/types"

const c = (id: string, parentId: string | null = null): Comment => ({
  id,
  questionId: "q",
  parentId,
  content: id,
  author: { uid: "u", displayName: "U", photoURL: null },
  createdAt: "2026-01-01T00:00:00.000Z",
  upvotes: 0,
  downvotes: 0,
})

describe("buildTree", () => {
  it("nests replies under their parents in order", () => {
    const tree = buildTree([c("a"), c("b"), c("a1", "a"), c("a1x", "a1")])
    expect(tree.map((n) => n.id)).toEqual(["a", "b"])
    expect(tree[0].replies[0].id).toBe("a1")
    expect(tree[0].replies[0].replies[0].id).toBe("a1x")
  })

  it("promotes replies whose parent is missing", () => {
    expect(buildTree([c("orphan", "gone"), c("a")]).map((n) => n.id)).toEqual([
      "orphan",
      "a",
    ])
  })

  it("puts the accepted answer first and keeps the rest in order", () => {
    const tree = buildTree([c("a"), c("b"), c("c")], "c")
    expect(tree.map((n) => n.id)).toEqual(["c", "a", "b"])
  })
})
