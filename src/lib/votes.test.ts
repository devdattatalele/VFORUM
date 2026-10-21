import { describe, expect, it } from "vitest"
import { voteDelta } from "@/lib/votes"

describe("voteDelta", () => {
  it("adds, removes and switches votes", () => {
    expect(voteDelta("none", "up")).toEqual({ up: 1, down: 0 })
    expect(voteDelta("up", "none")).toEqual({ up: -1, down: 0 })
    expect(voteDelta("up", "down")).toEqual({ up: -1, down: 1 })
    expect(voteDelta("down", "up")).toEqual({ up: 1, down: -1 })
    expect(voteDelta("down", "down")).toEqual({ up: 0, down: 0 })
  })
})
