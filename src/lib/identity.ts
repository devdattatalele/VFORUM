import type { PublicAuthor } from "@/lib/types"

export const ALLOWED_EMAIL_DOMAIN = "vit.edu.in"

export function isAllowedEmail(
  email: string | null | undefined
): email is string {
  return (
    typeof email === "string" &&
    email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
  )
}

export function parseEmailList(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

// Addresses in ADMIN_EMAILS are admins regardless of their stored role. The
// mailbox must be verified, or anyone could register an unclaimed admin address.
export function isBootstrapAdmin(
  email: string | undefined,
  emailVerified: boolean | undefined,
  adminEmails = process.env.ADMIN_EMAILS
): boolean {
  return (
    emailVerified === true &&
    typeof email === "string" &&
    parseEmailList(adminEmails).has(email.toLowerCase())
  )
}

// "priya.k_sharma@vit.edu.in" -> "Priya K Sharma". Used when sign-up gave no name.
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? ""
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
  return name || email
}

// The only author fields that leave the server. Older documents embed the whole
// profile (email, role, permissions); this strips them on every read.
export function publicAuthor(author: unknown): PublicAuthor {
  const a = (author ?? {}) as Record<string, unknown>
  return {
    uid: typeof a.uid === "string" ? a.uid : "",
    displayName: typeof a.displayName === "string" ? a.displayName : null,
    photoURL: typeof a.photoURL === "string" ? a.photoURL : null,
  }
}
