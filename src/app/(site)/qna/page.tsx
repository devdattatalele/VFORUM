"use client"

import { Suspense } from "react"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import QuestionList from "@/components/qna/QuestionList"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function ForumPage() {
  const { user } = useAuth()
  return (
    <>
      <PageHeader
        title="Forum"
        description="Questions from VIT students, answered by VIT students. Search first; someone in an earlier batch may have asked it."
        actions={
          <Button asChild>
            <Link href={user ? "/qna/ask" : "/auth"}>
              {user ? "Ask a question" : "Sign in to ask"}
            </Link>
          </Button>
        }
      />
      <Suspense>
        <QuestionList />
      </Suspense>
    </>
  )
}
