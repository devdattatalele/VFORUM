"use client"

import Link from "next/link"
import type { Question } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Tag as TagIcon,
  CalendarDays,
  UserCircle,
  Eye,
  ArrowUp,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import VoteButtons from "./VoteButtons"
import { COMMUNITIES } from "@/lib/constants"
import React from "react"
import { excerpt } from "@/lib/markdown"

interface QuestionCardProps {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const community = COMMUNITIES.find((c) => c.id === question.communityId)

  return (
    <Card className="border border-border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-muted-foreground">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={question.author.photoURL || undefined}
                alt={question.author.displayName || "User"}
              />
              <AvatarFallback>
                {question.author.displayName ? (
                  question.author.displayName.charAt(0).toUpperCase()
                ) : (
                  <UserCircle size={16} />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-foreground">
                {question.author.displayName}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {formatDistanceToNow(new Date(question.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {community && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="community"
                      className="flex-shrink-0 px-1.5 py-0.5 text-xs"
                    >
                      {community.icon && (
                        <community.icon className="mr-1 h-3 w-3" />
                      )}
                      {community.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{question.views || 0}</span>
          </div>
        </div>
        <Link href={`/qna/${question.id}`} className="group block">
          <CardTitle className="mt-3 line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {question.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="py-0 pb-4">
        <CardDescription className="mb-3 line-clamp-2 text-sm leading-relaxed text-foreground/80">
          {excerpt(question.content, 200)}
        </CardDescription>
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {question.tags.slice(0, 4).map((tag) => (
              <Link key={tag} href={`/qna?tag=${encodeURIComponent(tag)}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer text-xs transition-colors hover:bg-primary/20"
                >
                  <TagIcon className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              </Link>
            ))}
            {question.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{question.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium tabular-nums">
              {question.upvotes || 0}
            </span>
          </div>
          <Link
            href={`/qna/${question.id}#comments`}
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="tabular-nums">{question.replyCount || 0}</span>
          </Link>
        </div>
        <span className="text-xs text-muted-foreground">
          Last activity{" "}
          {formatDistanceToNow(
            new Date(question.lastActivityAt || question.createdAt),
            { addSuffix: true }
          )}
        </span>
      </CardFooter>
    </Card>
  )
}
