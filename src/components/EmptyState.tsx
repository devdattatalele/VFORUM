import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      {Icon && <Icon className="mb-3 h-6 w-6 text-muted-foreground" />}
      <p className="font-medium">{title}</p>
      {children && (
        <div className="mt-1 max-w-md text-sm text-muted-foreground">
          {children}
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
