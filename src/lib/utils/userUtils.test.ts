import { describe, expect, it } from "vitest"
import {
  canModerate,
  getPermissionsForRole,
  hasPermission,
  isAdmin,
  isModerator,
} from "@/lib/utils/userUtils"
import type { UserProfile } from "@/lib/types"

const profile = (uid: string, role: "user" | "moderator" | "admin"): UserProfile => ({
  uid,
  email: `${uid}@vit.edu.in`,
  displayName: uid,
  photoURL: null,
  role,
  permissions: getPermissionsForRole(role),
})

describe("roles and permissions", () => {
  it("grants capabilities by role", () => {
    expect(hasPermission(profile("a", "user"), "create_events")).toBe(false)
    expect(hasPermission(profile("a", "moderator"), "create_events")).toBe(true)
    expect(hasPermission(profile("a", "moderator"), "manage_users")).toBe(false)
    expect(hasPermission(profile("a", "admin"), "manage_users")).toBe(true)
    expect(hasPermission(null, "vote")).toBe(false)
  })

  it("treats admins as moderators", () => {
    expect(isModerator(profile("a", "admin"))).toBe(true)
    expect(isAdmin(profile("a", "moderator"))).toBe(false)
  })

  it("lets authors and moderators modify content, nobody else", () => {
    expect(canModerate(profile("author", "user"), "author")).toBe(true)
    expect(canModerate(profile("other", "user"), "author")).toBe(false)
    expect(canModerate(profile("mod", "moderator"), "author")).toBe(true)
    expect(canModerate(null, "author")).toBe(false)
    expect(canModerate(profile("other", "user"), undefined)).toBe(false)
  })
})
