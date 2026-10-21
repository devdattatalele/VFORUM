import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { COMMUNITIES } from "@/lib/constants"

// Letter tiles and counts, like vboard's "Find your community".
export default function CommunityList({
  counts,
}: {
  counts?: Record<string, number>
}) {
  return (
    <ul className="divide-y">
      {COMMUNITIES.filter((c) => c.id !== "all").map((c) => (
        <li key={c.id}>
          <Link
            href={`/community/${c.id}`}
            className="group flex items-center gap-3 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-medium">
              {c.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {c.name}
              </span>
              {counts && (
                <span className="text-xs text-muted-foreground">
                  {counts[c.id] ?? 0}{" "}
                  {(counts[c.id] ?? 0) === 1 ? "question" : "questions"}
                </span>
              )}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
