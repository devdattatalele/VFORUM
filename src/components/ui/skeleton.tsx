import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-700 rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-gray-600 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

// Preset skeleton components for common use cases
function SkeletonCard() {
  return (
    <div className="p-6 space-y-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-[125px] w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-8 w-[80px] rounded-md" />
        <Skeleton className="h-8 w-[100px] rounded-md" />
      </div>
    </div>
  )
}

function SkeletonEventCard() {
  return (
    <div className="overflow-hidden border rounded-lg bg-card">
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-8 w-[80px] rounded-md" />
        </div>
      </div>
    </div>
  )
}

function SkeletonQuestionCard() {
  return (
    <div className="p-6 space-y-4 border rounded-lg bg-card">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-[60px] rounded-full" />
            <Skeleton className="h-5 w-[80px] rounded-full" />
            <Skeleton className="h-5 w-[70px] rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[70px]" />
          <Skeleton className="h-4 w-[50px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </div>
    </div>
  )
}

function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonQuestionCard key={i} />
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonEventCard, 
  SkeletonQuestionCard, 
  SkeletonList 
}
