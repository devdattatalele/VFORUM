"use client"

import type { Comment as CommentType } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import VoteButtons from "./VoteButtons"
import { UserCircle, CalendarDays } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import React from "react"

interface CommentCardProps {
  comment: CommentType
  questionId: string
}

export default function CommentCard({ comment, questionId }: CommentCardProps) {
  return (
    <Card className="border border-white/10 bg-card/70 shadow-sm backdrop-blur-md">
      <CardHeader className="px-4 pb-2 pt-4">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={comment.author.photoURL || undefined}
              alt={comment.author.displayName || "Author"}
            />
            <AvatarFallback className="text-xs">
              {comment.author.displayName ? (
                comment.author.displayName.charAt(0).toUpperCase()
              ) : (
                <UserCircle size={12} />
              )}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">
            {comment.author.displayName || "Anonymous"}
          </span>
          <span className="text-muted-foreground/70">&bull;</span>
          <CalendarDays className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <p className="whitespace-pre-wrap text-sm text-foreground/90">
          {comment.content}
        </p>
      </CardContent>
      <CardFooter className="px-4 pb-3 pt-2">
        <VoteButtons
          initialUpvotes={comment.upvotes}
          initialDownvotes={comment.downvotes || 0}
          id={comment.id}
          type="comment"
          questionId={questionId}
          orientation="horizontal"
          size="sm"
        />
        {/* Reply button can be added here if threading is implemented further */}
        {/* <Button variant="ghost" size="sm" className="ml-auto text-xs">Reply</Button> */}
      </CardFooter>
    </Card>
  )
}
