"use client";

import React, { useState } from 'react';
import type { Comment as CommentType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import VoteButtons from './VoteButtons';
import CommentForm from './CommentForm';
import CompactCommentForm from './CompactCommentForm';
import { UserCircle, CalendarDays, MessageSquare, ChevronDown, ChevronUp, Share, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateComment } from '@/lib/services/commentService';

interface ThreadedCommentCardProps {
  comment: CommentType;
  questionId: string;
  level?: number;
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit?: () => void; // Callback to refresh comments after edit
  children?: React.ReactNode; // For nested replies
}

export default function ThreadedCommentCard({ 
  comment, 
  questionId, 
  level = 0, 
  onReply,
  onEdit,
  children 
}: ThreadedCommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const maxLevel = 8; // Maximum nesting level
  const isMaxLevel = level >= maxLevel;
  
  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setShowReplyForm(false);
  };

  const handleCancel = () => {
    setShowReplyForm(false);
    setShowEditForm(false);
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/qna/${questionId}#comment-${comment.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Comment link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setShowReplyForm(false);
  };

  const handleEditSubmit = async (content: string) => {
    if (!user) return;
    
    try {
      await updateComment(questionId, comment.id, content, user.uid);
      setShowEditForm(false);
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
      
      // Call the onEdit callback to refresh comments
      if (onEdit) {
        onEdit();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Update failed",
        description: "Unable to update comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CollapseButton = () => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-muted/50"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isCollapsed ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronUp className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div 
      id={`comment-${comment.id}`}
      className={cn(
        "relative",
        level > 0 && "ml-10", // Increased indentation
        isCollapsed && "opacity-60"
      )}
    >
      {/* Threading line for nested comments */}
      {level > 0 && (
        <div className="absolute left-[-20px] top-0 bottom-0 w-[2px] bg-border/30" />
      )}
      
      <div className={cn(
        "group relative bg-background/50 rounded-lg p-4 hover:bg-muted/30 transition-colors", // Increased padding
        level === 0 && "border border-border/50 shadow-sm"
      )}>
        <div className="flex gap-3"> {/* Increased gap */}
          {/* Collapse button for threads with replies */}
          <div className="flex flex-col items-center pt-1">
            {children && <CollapseButton />}
            <Avatar className="h-8 w-8 mt-1"> {/* Increased avatar size */}
              <AvatarImage src={comment.author.photoURL || undefined} alt={comment.author.displayName || 'Author'} />
              <AvatarFallback className="text-sm">
                {comment.author.displayName ? comment.author.displayName.charAt(0).toUpperCase() : <UserCircle size={14}/>}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment header */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3"> {/* Increased gaps and margin */}
              <span className="font-medium text-foreground hover:text-primary cursor-pointer text-base"> {/* Increased font size */}
                {comment.author.displayName || 'Anonymous'}
              </span>
              <span className="opacity-70">•</span>
              <CalendarDays className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
              {level > 0 && (
                <>
                  <span className="opacity-70">•</span>
                  <span className="text-xs opacity-70">level {level}</span>
                </>
              )}
            </div>

            {/* Comment content */}
            {!isCollapsed && (
              <>
                <div className="text-base text-foreground/90 whitespace-pre-wrap mb-4 leading-relaxed"> {/* Increased font size and margin */}
                  {comment.content}
                </div>

                {/* Comment actions */}
                <div className="flex items-center gap-3"> {/* Increased gap */}
                  <VoteButtons 
                    initialUpvotes={comment.upvotes || 0}
                    initialDownvotes={comment.downvotes || 0}
                    id={comment.id}
                    type="comment"
                    questionId={questionId}
                    orientation="horizontal"
                    size="sm"
                    mode="like"
                  />
                  
                  {user && !isMaxLevel && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-sm hover:bg-muted" // Increased height and padding
                      onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )}
                  
                  {/* Share button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-sm hover:bg-muted" // Increased height and padding
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  
                  {/* Edit button for comment author */}
                  {user?.uid === comment.author.uid && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-sm hover:bg-muted" // Increased height and padding
                      onClick={handleEdit}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {/* Reply form */}
                {showReplyForm && (
                  <div className="mt-4 border-l-2 border-primary/30 pl-4"> {/* Increased margins and padding */}
                    <CompactCommentForm
                      questionId={questionId}
                      parentId={comment.id}
                      onSubmit={handleReply}
                      onCancel={handleCancel}
                      placeholder={`Reply to ${comment.author.displayName || 'this comment'}...`}
                    />
                  </div>
                )}

                {/* Edit form */}
                {showEditForm && (
                  <div className="mt-4 border-l-2 border-orange-500/30 pl-4"> {/* Increased margins and padding */}
                    <CompactCommentForm
                      questionId={questionId}
                      parentId={null}
                      onSubmit={handleEditSubmit}
                      onCancel={handleCancel}
                      placeholder="Edit your comment..."
                      initialContent={comment.content}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {!isCollapsed && children && (
        <div className="mt-3"> {/* Increased margin */}
          {children}
        </div>
      )}
    </div>
  );
} 