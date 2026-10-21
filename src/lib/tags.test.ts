import { describe, expect, it } from "vitest"
import { normalizeTag, normalizeTags } from "@/lib/tags"

describe("normalizeTag", () => {
  it("lowercases, hyphenates and strips unsafe characters", () => {
    expect(normalizeTag("  Machine   Learning ")).toBe("machine-learning")
    expect(normalizeTag("CI/CD")).toBe("cicd")
    expect(normalizeTag("C++")).toBe("c++")
    expect(normalizeTag("C#")).toBe("c#")
    expect(normalizeTag("node.js")).toBe("node.js")
    expect(normalizeTag("--a--b--")).toBe("a-b")
    expect(normalizeTag("<script>")).toBe("script")
  })

  it("dedupes and drops empty results", () => {
    expect(normalizeTags(["React", "react", " ", "!!"])).toEqual(["react"])
  })
})
