// Seeded accounts for `npm run dev:local`. They exist only in the Firebase Auth
// emulator, so the password protects nothing real. Roles resolve from Firestore
// exactly as in production; the switcher replaces typing, not authorization.
export const DEV_PASSWORD = "vforum-local-only"

export const DEV_PERSONAS = [
  {
    uid: "dev-admin",
    email: "aarav.admin@vit.edu.in",
    displayName: "Aarav Admin",
    role: "admin",
    label: "Admin",
    description: "Manages roles, reviews reports, reads the audit log",
  },
  {
    uid: "dev-moderator",
    email: "meera.moderator@vit.edu.in",
    displayName: "Meera Moderator",
    role: "moderator",
    label: "Moderator",
    description: "Creates events, pins, locks and removes posts",
  },
  {
    uid: "dev-student",
    email: "sahil.student@vit.edu.in",
    displayName: "Sahil Student",
    role: "user",
    label: "Student",
    description: "Asks, answers and votes",
  },
  {
    uid: "dev-student-2",
    email: "riya.student@vit.edu.in",
    displayName: "Riya Student",
    role: "user",
    label: "Second student",
    description: "Answers Sahil's questions, to see notifications",
  },
] as const

export type DevPersona = (typeof DEV_PERSONAS)[number]
