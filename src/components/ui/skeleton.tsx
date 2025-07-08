import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "dark:before:via-white/5",
        className
      )}
      {...props}
    />
  )
}

// Skeleton variants for common use cases
const SkeletonCard = () => (
  <div className="space-y-4 p-6 bg-card rounded-lg border">
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
)

const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-card rounded-lg border">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
)

const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          "h-4",
          i === lines - 1 ? "w-2/3" : "w-full"
        )}
      />
    ))}
  </div>
)

export { Skeleton, SkeletonCard, SkeletonList, SkeletonText }
