import { describe, expect, it } from "vitest"
import {
  isAllowedEmail,
  isBootstrapAdmin,
  nameFromEmail,
  parseEmailList,
  publicAuthor,
} from "@/lib/identity"

describe("isAllowedEmail", () => {
  it("accepts only the college domain, case-insensitively", () => {
    expect(isAllowedEmail("a.b@vit.edu.in")).toBe(true)
    expect(isAllowedEmail("A.B@VIT.EDU.IN")).toBe(true)
    expect(isAllowedEmail("a@sub.vit.edu.in")).toBe(false)
    expect(isAllowedEmail("a@vit.edu.in.evil.com")).toBe(false)
    expect(isAllowedEmail("a@gmail.com")).toBe(false)
    expect(isAllowedEmail(undefined)).toBe(false)
  })
})

describe("isBootstrapAdmin", () => {
  const list = " Admin@vit.edu.in, second@vit.edu.in ,"
  it("matches listed addresses case-insensitively", () => {
    expect(parseEmailList(list)).toEqual(
      new Set(["admin@vit.edu.in", "second@vit.edu.in"])
    )
    expect(isBootstrapAdmin("admin@vit.edu.in", true, list)).toBe(true)
    expect(isBootstrapAdmin("SECOND@vit.edu.in", true, list)).toBe(true)
  })

  it("requires a verified mailbox", () => {
    expect(isBootstrapAdmin("admin@vit.edu.in", false, list)).toBe(false)
    expect(isBootstrapAdmin("admin@vit.edu.in", undefined, list)).toBe(false)
  })

  it("grants nothing when the list is empty or the address is absent", () => {
    expect(isBootstrapAdmin("admin@vit.edu.in", true, "")).toBe(false)
    expect(isBootstrapAdmin("admin@vit.edu.in", true, undefined)).toBe(false)
    expect(isBootstrapAdmin("other@vit.edu.in", true, list)).toBe(false)
  })
})

describe("nameFromEmail", () => {
  it("derives a readable name from the mailbox", () => {
    expect(nameFromEmail("priya.k_sharma@vit.edu.in")).toBe("Priya K Sharma")
    expect(nameFromEmail("devdatta@vit.edu.in")).toBe("Devdatta")
  })
})

describe("publicAuthor", () => {
  it("drops everything but uid, name and photo", () => {
    const stored = {
      uid: "u1",
      displayName: "A",
      photoURL: null,
      email: "a@vit.edu.in",
      role: "admin",
      permissions: ["manage_users"],
    }
    expect(publicAuthor(stored)).toEqual({
      uid: "u1",
      displayName: "A",
      photoURL: null,
    })
    expect(publicAuthor(undefined)).toEqual({
      uid: "",
      displayName: null,
      photoURL: null,
    })
  })
})
