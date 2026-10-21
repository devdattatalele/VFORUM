import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SolvedBadge({
  label = "Solved",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400",
        className
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  )
}
