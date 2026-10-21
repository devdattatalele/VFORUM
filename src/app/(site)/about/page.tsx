import type { Metadata } from "next"
import Link from "next/link"
import PageHeader, { SectionHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "About" }

const FACTS = [
  { label: "Built by", value: "Devdatta Talele" },
  { label: "For", value: "VIT students, @vit.edu.in" },
  { label: "License", value: "MIT" },
  { label: "Model", value: "VOSS Labs project" },
]

const PROBLEMS = [
  "Answers given in WhatsApp groups scroll away and are asked again next semester.",
  "First years do not know which club or senior to ask.",
  "Event announcements get lost between unrelated messages.",
]

const FEATURES = [
  [
    "Q&A with code",
    "Questions and answers in Markdown with highlighted code blocks, threaded replies, votes and search.",
  ],
  [
    "Accepted answers",
    "The person who asked marks the answer that worked. It leads the thread, and the question shows Solved.",
  ],
  [
    "Notifications",
    "You hear about answers to your questions, replies to you, and accepted answers.",
  ],
  [
    "Profiles",
    "Every member has a page with their questions, answers and upvotes.",
  ],
  [
    "Moderation",
    "Students report spam or abuse; moderators review a queue, pin and lock questions, and remove content. Every privileged action is logged.",
  ],
  ["Events", "Clubs post upcoming workshops and hackathons with RSVP links."],
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <PageHeader
        eyebrow="About"
        title="A forum that remembers."
        description="vforum is a question-and-answer forum for Vidyalankar Institute of Technology, Mumbai. Ask once, and the answer stays findable for every batch after."
      />

      <dl className="grid grid-cols-2 border-t sm:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.label} className="border-b py-4 pr-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {f.label}
            </dt>
            <dd className="mt-1 text-sm font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <SectionHeader title="The problem" />
        <ul className="space-y-2 text-muted-foreground">
          {PROBLEMS.map((p) => (
            <li key={p} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
              />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader title="What vforum does" />
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {FEATURES.map(([title, body]) => (
            <div key={title}>
              <dt className="font-medium">{title}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <SectionHeader title="How it is built" />
        <p className="text-muted-foreground">
          Next.js and TypeScript on Vercel, with Firebase Auth and Firestore.
          Every server action verifies who is calling it. The repository follows
          the{" "}
          <a
            href="https://github.com/voss-labs"
            className="text-foreground underline underline-offset-4"
          >
            VOSS Labs
          </a>{" "}
          project model: one check command, CI on every pull request, a written
          plan, and local development that needs no credentials.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/qna">Browse the forum</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="https://github.com/devdattatalele/VFORUM">
              Source on GitHub
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/help">Help and FAQ</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
