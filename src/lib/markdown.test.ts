import { describe, expect, it } from "vitest"
import { excerpt, plainText } from "@/lib/markdown"

describe("plainText", () => {
  it("drops code blocks and markup but keeps the words", () => {
    const md = [
      "## Why does `useEffect` run **twice**?",
      "",
      "See [the docs](https://react.dev) and _this_:",
      "",
      "```tsx",
      "useEffect(() => {}, [])",
      "```",
      "- one",
      "1. two",
    ].join("\n")
    expect(plainText(md)).toBe(
      "Why does useEffect run twice? See the docs and this: one two"
    )
  })

  it("leaves snake_case and arithmetic alone", () => {
    expect(plainText("use snake_case_names and 2 * 3 * 4")).toBe(
      "use snake_case_names and 2 * 3 * 4"
    )
  })

  it("survives an unclosed fence", () => {
    expect(plainText("text ```js\nconst a = 1")).toBe("text")
  })
})

describe("excerpt", () => {
  it("cuts long text", () => {
    expect(excerpt("a ".repeat(200), 10)).toBe("a a a a a...")
    expect(excerpt("short")).toBe("short")
  })
})
