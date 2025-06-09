
"use client";

import { useParams, useRouter } from "next/navigation";
import type { Question, Comment as CommentType } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VoteButtons from "@/components/qna/VoteButtons";
import CommentCard from "@/components/qna/CommentCard";
import CommentForm from "@/components/qna/CommentForm";
import { CalendarDays, MessageSquare, Tag as TagIcon, UserCircle, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { getQuestionById } from "@/lib/services/questionService";
import { getCommentsForQuestion, addComment } from "@/lib/services/commentService";
import { COMMUNITIES } from "@/lib/constants";


export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null | undefined>(undefined);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (questionId) {
      setIsLoading(true);
      setError(null);
      Promise.all([
        getQuestionById(questionId),
        getCommentsForQuestion(questionId)
      ]).then(([fetchedQuestion, fetchedComments]) => {
        setQuestion(fetchedQuestion || null);
        setComments(fetchedComments || []);
      }).catch(err => {
        console.error("Error fetching question details:", err);
        setError("Could not load the question or comments.");
        setQuestion(null);
        setComments([]);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [questionId]);

  const handleCommentSubmit = async (content: string) => {
    if (!user || !question) {
      alert("You must be logged in to comment or question not found.");
      return;
    }
    try {
      const newCommentId = await addComment(question.id, { content }, user);
      // Optimistically add comment to UI or re-fetch
      const newComment: CommentType = {
        id: newCommentId, // This might be Firestore generated ID or a temp one
        questionId: question.id,
        author: user,
        content,
        createdAt: new Date().toISOString(),
        upvotes: 0,
      };
      setComments(prevComments => [newComment, ...prevComments]);
    } catch (err) {
      console.error("Failed to submit comment:", err);
      alert("Failed to post your answer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3">Loading question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/qna')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Q&A
        </Button>
      </div>
    );
  }
  
  if (!question) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Question Not Found</h1>
        <p className="text-muted-foreground mb-6">The question you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push('/qna')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Q&A Forum
        </Button>
      </div>
    );
  }

  const community = COMMUNITIES.find(c => c.id === question.communityId);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{question.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={question.author.photoURL || undefined} alt={question.author.displayName || 'Author'} />
              <AvatarFallback className="text-xs">
                {question.author.displayName ? question.author.displayName.charAt(0).toUpperCase() : <UserCircle size={14}/>}
              </AvatarFallback>
            </Avatar>
            <span>{question.author.displayName || 'Anonymous'}</span>
            <span className="text-muted-foreground/50">&bull;</span>
            <CalendarDays className="h-4 w-4" />
            <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
            {community && <Badge variant="outline" className="ml-auto">{community.name}</Badge>}
          </div>
           {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {question.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  <TagIcon className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{question.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <VoteButtons 
            initialUpvotes={question.upvotes} 
            initialDownvotes={question.downvotes}
            id={question.id} 
            orientation="horizontal"
            size="default"
            // onVote={(voteType) => console.log("Voted:", voteType, "on question", question.id)} // Placeholder
          />
          <div className="flex items-center text-muted-foreground">
            <MessageSquare className="mr-2 h-5 w-5" />
            <span>{comments.length} Answer{comments.length === 1 ? '' : 's'}</span>
          </div>
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Answers</h2>
      {user ? (
        <CommentForm questionId={question.id} onSubmit={handleCommentSubmit} />
      ) : (
        <Card className="my-4 p-4 text-center glass-card">
          <p className="text-muted-foreground">
             You need to be signed in to post an answer.
            <Button variant="link" asChild className="px-1"><Link href={`/?redirect=/qna/${questionId}`}>Sign in</Link></Button>
          </p>
        </Card>
      )}

      <div className="space-y-6 mt-6">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">No answers yet. Be the first to help!</p>
        )}
      </div>
    </div>
  );
}
