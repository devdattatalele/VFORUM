import Link from "next/link"
import { cn } from "@/lib/utils"

// Lowercase product name and an orange dot, like vboard.
export default function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="vforum home"
      className={cn(
        "inline-flex items-center gap-1 text-lg font-semibold tracking-tight text-foreground",
        className
      )}
    >
      vforum
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
    </Link>
  )
}
