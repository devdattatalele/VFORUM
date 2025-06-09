"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompactCommentFormProps {
  questionId: string;
  parentId?: string | null;
  onSubmit: (content: string, parentId?: string | null) => Promise<void>;
  onCancel?: () => void; 
  placeholder?: string;
  className?: string;
  initialContent?: string;
}

const commentFormSchema = z.object({
  content: z.string().min(1, "Please write something.").max(2000, "Comment is too long."),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

export default function CompactCommentForm({ 
  questionId, 
  parentId, 
  onSubmit, 
  onCancel, 
  placeholder = "Write a comment...",
  className,
  initialContent = ""
}: CompactCommentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const watchedContent = form.watch("content");

  useEffect(() => {
    if (initialContent) {
      form.setValue("content", initialContent);
      setIsExpanded(true);
    }
  }, [initialContent, form]);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const setTextareaRef = useCallback((el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
  }, []);

  async function handleSubmit(data: CommentFormValues) {
    if (!user) {
      toast({ title: "Not Signed In", description: "Please sign in to post a comment.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data.content, parentId);
      form.reset(); 
      setIsExpanded(false);
      toast({ title: "Comment Posted!", description: "Your comment has been added."});
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({ title: "Error", description: "Could not post your comment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleExpand = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to post a comment.", variant: "destructive" });
      return;
    }
    setIsExpanded(true);
  };

  const handleCancel = () => {
    form.reset();
    setIsExpanded(false);
    if (onCancel) {
      onCancel();
    }
  };

  if (!user) {
    return (
      <div className={cn("p-3 border rounded-lg bg-muted/30 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          Sign in to join the conversation
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!isExpanded ? (
        // Compact input
        <div 
          className="flex items-center gap-2 p-3 border rounded-full bg-background hover:bg-muted/30 cursor-text transition-colors"
          onClick={handleExpand}
        >
          <div className="flex-1 text-sm text-muted-foreground">
            {placeholder}
          </div>
          <Send className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : (
        // Expanded form
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 p-3 border rounded-lg bg-background">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={placeholder}
                      className="resize-none min-h-[80px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent"
                      {...field}
                      ref={(el) => {
                        field.ref(el);
                        setTextareaRef(el);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {watchedContent.length}/2000
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isSubmitting || !watchedContent.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
} 