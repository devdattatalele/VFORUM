import Link from "next/link"
import Wordmark from "@/components/layout/Wordmark"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Wordmark />
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-brand">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground">
          The link may be old, or the page was moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/qna">Go to the forum</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  )
}
