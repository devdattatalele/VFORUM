import type { Metadata } from "next"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import PageHeader from "@/components/PageHeader"

export const metadata: Metadata = { title: "Help" }

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Who can use vforum?",
    a: "Anyone can read. To ask, answer or vote, sign in with your @vit.edu.in email address.",
  },
  {
    q: "How do I ask a good question?",
    a: (
      <>
        Search first; someone may have asked it already. Then use{" "}
        <Link href="/qna/ask" className="underline underline-offset-4">
          Ask a question
        </Link>
        , say what you tried and what happened instead, pick the right community
        and up to five tags, and paste code as text.
      </>
    ),
  },
  {
    q: "How do I format code?",
    a: "Questions and answers support Markdown. Wrap code in three backticks and name the language, like ```python, to get highlighting. The ask form has a Preview button.",
  },
  {
    q: "What does accepting an answer do?",
    a: "The person who asked can mark one answer as accepted. It moves to the top of the thread with a check, and the question shows Solved in the forum, so the next person finds the fix quickly.",
  },
  {
    q: "How do votes work?",
    a: "Upvote questions that are clear and useful, and like answers that helped. You get one vote per item and can change or remove it.",
  },
  {
    q: "When do I get notifications?",
    a: "When someone answers or comments on your question, replies to your comment, or accepts your answer. The bell in the header shows them; opening one marks it read.",
  },
  {
    q: "Can I edit or delete what I posted?",
    a: "Yes. You can edit or delete your own questions and answers. Deleting an answer removes its text but keeps replies to it, so the thread still makes sense.",
  },
  {
    q: "How do I report spam or abuse?",
    a: "Use Report on the question or comment. Moderators see every report, and the author is not told who reported it.",
  },
  {
    q: "Who can create events?",
    a: "Moderators and admins. If your club needs to post events, ask an admin for the moderator role.",
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Help"
        description="Answers to the questions people ask about vforum itself."
      />
      <div className="divide-y border-y">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
