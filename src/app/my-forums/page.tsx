import { Suspense } from "react"
import MyForumsList from "@/components/qna/MyForumsList"
import { Loader2 } from "lucide-react"

function MyForumsListSkeleton() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading your forums...</p>
    </div>
  )
}

export default function MyForumsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-10">
        <h1 className="mb-4 font-headline text-5xl font-bold text-foreground">
          My Forums
        </h1>
        <p className="text-xl leading-relaxed text-muted-foreground">
          Manage your posted questions and discussions. You can edit or delete
          your own forum posts here.
        </p>
      </div>
      <Suspense fallback={<MyForumsListSkeleton />}>
        <MyForumsList />
      </Suspense>
    </div>
  )
}
