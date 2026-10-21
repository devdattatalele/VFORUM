import { Suspense } from "react"
import QuestionList from "@/components/qna/QuestionList"
import { Loader2 } from "lucide-react"

function QuestionListSkeleton() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading questions...</p>
    </div>
  )
}

export default function QnAPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-10">
        <h1 className="mb-4 font-headline text-5xl font-bold text-foreground">
          Q&amp;A Forum
        </h1>
        <p className="text-xl leading-relaxed text-muted-foreground">
          Ask questions, share knowledge, and connect with the community. Browse
          by tags to find topics you're interested in.
        </p>
      </div>
      <Suspense fallback={<QuestionListSkeleton />}>
        <QuestionList />
      </Suspense>
    </div>
  )
}
