import type { Metadata } from "next"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import MyForumsList from "@/components/qna/MyForumsList"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Your questions" }

export default function MyQuestionsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Your questions"
        description="Everything you have asked. Open one to edit it, or delete it here."
        actions={
          <Button asChild>
            <Link href="/qna/ask">Ask a question</Link>
          </Button>
        }
      />
      <MyForumsList />
    </div>
  )
}
