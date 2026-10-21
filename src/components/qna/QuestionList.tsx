"use client"

import type { Question } from "@/lib/types"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ListFilter,
  PlusCircle,
  Search,
  HelpCircle,
  Loader2,
  MessageSquare,
  Eye,
  GitCommitVertical,
  TrendingUp,
  Pin,
  Lock,
  ArrowUp,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useEffect, useState } from "react"
import { getQuestions } from "@/lib/services/questionService"
import { COMMUNITIES } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { excerpt } from "@/lib/markdown"
import SolvedBadge from "@/components/qna/SolvedBadge"

// Moderators pin questions to the top; the chosen sort applies below them.
const pinnedFirst = (list: Question[]) =>
  [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))

export default function QuestionList() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const communityFilter = searchParams.get("community")
  const tagFilter = searchParams.get("tag")
  const searchFromUrl = searchParams.get("search")
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || "")
  const [show, setShow] = useState<"all" | "unanswered" | "solved">("all")
  const [sortBy, setSortBy] = useState("activity-desc") // 'activity-desc', 'activity-asc', 'recent-desc', 'recent-asc', 'popular-desc', 'replies-desc', 'upvotes-desc'
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true)
      setError(null)
      try {
        const fetchedQuestions = await getQuestions()
        setQuestions(fetchedQuestions)
      } catch (err) {
        console.error("Failed to fetch questions:", err)
        setError("Could not load questions. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  // Update search term when URL parameter changes
  useEffect(() => {
    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchFromUrl])

  const filteredQuestions = React.useMemo(() => {
    let processedQuestions = questions
    if (communityFilter && communityFilter !== "all") {
      processedQuestions = processedQuestions.filter(
        (q) => q.communityId === communityFilter
      )
    }
    if (tagFilter) {
      processedQuestions = processedQuestions.filter((q) =>
        q.tags.includes(tagFilter)
      )
    }
    if (show === "unanswered") {
      processedQuestions = processedQuestions.filter((q) => !q.replyCount)
    } else if (show === "solved") {
      processedQuestions = processedQuestions.filter((q) => q.acceptedAnswerId)
    }
    if (searchTerm) {
      processedQuestions = processedQuestions.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    }

    // Copy before sorting: processedQuestions can be the state array itself.
    return pinnedFirst(
      [...processedQuestions].sort((a, b) => {
        const aActivity = a.lastActivityAt || a.createdAt
        const bActivity = b.lastActivityAt || b.createdAt

        switch (sortBy) {
          case "recent-desc":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          case "recent-asc":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          case "activity-desc":
            return new Date(bActivity).getTime() - new Date(aActivity).getTime()
          case "activity-asc":
            return new Date(aActivity).getTime() - new Date(bActivity).getTime()
          case "popular-desc": // by views
            return (b.views || 0) - (a.views || 0)
          case "replies-desc":
            return (b.replyCount || 0) - (a.replyCount || 0)
          case "upvotes-desc":
            return (b.upvotes || 0) - (a.upvotes || 0)
          default:
            return new Date(bActivity).getTime() - new Date(aActivity).getTime()
        }
      })
    )
  }, [questions, communityFilter, tagFilter, searchTerm, sortBy, show])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10 text-center text-destructive">
        <HelpCircle className="mx-auto mb-4 h-12 w-12" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-[calc(var(--header-height,64px)+1rem)] z-30 flex flex-col items-center justify-between gap-4 rounded-lg border-b border-border bg-background/80 p-4 dark:bg-background/50 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="bg-background/70 pl-10 focus:bg-background dark:bg-background/70 dark:focus:bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div
            role="group"
            aria-label="Show"
            className="flex rounded-md border bg-background/70 p-0.5"
          >
            {(["all", "unanswered", "solved"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={show === value ? "secondary" : "ghost"}
                className="h-8 capitalize"
                aria-pressed={show === value}
                onClick={() => setShow(value)}
              >
                {value}
              </Button>
            ))}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-background/70 focus:bg-background dark:bg-background/70 dark:focus:bg-background sm:w-[180px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity-desc">
                Last Activity (Newest)
              </SelectItem>
              <SelectItem value="activity-asc">
                Last Activity (Oldest)
              </SelectItem>
              <SelectItem value="recent-desc">Created (Newest)</SelectItem>
              <SelectItem value="recent-asc">Created (Oldest)</SelectItem>
              <SelectItem value="upvotes-desc">Most Upvoted</SelectItem>
              <SelectItem value="popular-desc">Views</SelectItem>
              <SelectItem value="replies-desc">Replies</SelectItem>
            </SelectContent>
          </Select>
          {user ? (
            <Button
              asChild
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              <Link href="/qna/ask">
                <PlusCircle className="mr-2 h-4 w-4" /> Ask Question
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/auth">
                <PlusCircle className="mr-2 h-4 w-4" /> Sign In to Ask
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Display current filters */}
      {(tagFilter || communityFilter) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          {tagFilter && (
            <Badge variant="outline" className="bg-primary/10">
              Tag: {tagFilter}
              <Link href="/qna" className="ml-2 hover:text-destructive">
                ×
              </Link>
            </Badge>
          )}
          {communityFilter && communityFilter !== "all" && (
            <Badge variant="community" className="px-1.5 py-0.5">
              Community:{" "}
              {COMMUNITIES.find((c) => c.id === communityFilter)?.name ||
                communityFilter}
              <Link href="/qna" className="ml-2 hover:text-destructive">
                ×
              </Link>
            </Badge>
          )}
        </div>
      )}

      {filteredQuestions.length > 0 ? (
        <Table className="mt-0">
          <TableHeader>
            <TableRow className="border-b-border hover:bg-transparent">
              <TableHead className="w-[50%] font-semibold text-muted-foreground">
                Topic
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Upvotes
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Replies
              </TableHead>
              <TableHead className="text-center font-semibold text-muted-foreground">
                Views
              </TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">
                Activity
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => {
              const community = COMMUNITIES.find(
                (c) => c.id === question.communityId
              )
              return (
                <TableRow
                  key={question.id}
                  className="border-b-border hover:bg-muted/30 dark:hover:bg-muted/10"
                >
                  <TableCell className="py-3 align-top">
                    <Link href={`/qna/${question.id}`} className="group block">
                      <h3 className="mb-1 line-clamp-2 text-base font-medium text-foreground transition-colors group-hover:text-primary">
                        {question.pinned && (
                          <Pin
                            className="mr-1.5 inline-block h-4 w-4 text-primary"
                            aria-label="Pinned"
                          />
                        )}
                        {question.title}
                        {question.locked && (
                          <Lock
                            className="ml-1.5 inline-block h-3.5 w-3.5 text-muted-foreground"
                            aria-label="Locked"
                          />
                        )}
                        {question.acceptedAnswerId && (
                          <SolvedBadge className="ml-2 align-middle" />
                        )}
                      </h3>
                    </Link>
                    <div className="mb-1.5 flex items-center space-x-2 text-xs text-muted-foreground">
                      {community && (
                        <Badge variant="community" className="px-1.5 py-0.5">
                          {community.icon && (
                            <community.icon className="mr-1 h-3 w-3" />
                          )}
                          {community.name}
                        </Badge>
                      )}
                      {question.tags.slice(0, 2).map((tag) => (
                        <Link
                          key={tag}
                          href={`/qna?tag=${encodeURIComponent(tag)}`}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer px-1.5 py-0.5 transition-colors hover:bg-primary/20"
                          >
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {excerpt(question.content, 100)}
                    </p>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {question.upvotes || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle text-sm tabular-nums text-foreground">
                    {question.replyCount || 0}
                  </TableCell>
                  <TableCell className="text-center align-middle text-sm tabular-nums text-foreground">
                    {Intl.NumberFormat("en", { notation: "compact" }).format(
                      question.views || 0
                    )}
                  </TableCell>
                  <TableCell className="text-right align-middle text-xs text-muted-foreground">
                    <div className="flex items-center justify-end gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={question.author.photoURL || undefined}
                          alt={question.author.displayName || "Author"}
                        />
                        <AvatarFallback className="text-xs">
                          {question.author.displayName ? (
                            question.author.displayName.charAt(0).toUpperCase()
                          ) : (
                            <UserCircle size={12} />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {question.author.displayName || "Anonymous"}
                        </div>
                        <div>
                          {formatDistanceToNow(
                            new Date(
                              question.lastActivityAt || question.createdAt
                            ),
                            { addSuffix: true }
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="mt-8 rounded-lg border border-white/10 bg-card/80 py-16 text-center shadow-sm backdrop-blur-md">
          <HelpCircle className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-2xl font-semibold text-foreground">
            No Questions Found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {searchTerm || tagFilter || communityFilter
              ? "It seems there are no questions matching your current search or filter criteria. Try broadening your search!"
              : "There are currently no questions in the forum. Why not be the first to ask one?"}
          </p>
          {!(searchTerm || tagFilter || communityFilter) &&
            (user ? (
              <Button
                asChild
                className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/qna/ask">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ask Your First
                  Question
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="mt-8">
                <Link href="/auth">
                  <PlusCircle className="mr-2 h-4 w-4" /> Sign In to Ask
                  Questions
                </Link>
              </Button>
            ))}
        </div>
      )}
    </div>
  )
}
