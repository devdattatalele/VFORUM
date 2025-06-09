
"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommentFormProps {
  questionId: string;
  parentId?: string | null;
  onSubmit: (content: string, parentId?: string | null) => Promise<void>; // Updated to include parentId
  onCancel?: () => void; 
  placeholder?: string;
}

const commentFormSchema = z.object({
  content: z.string().min(5, "Comment must be at least 5 characters.").max(2000, "Comment is too long."),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

export default function CommentForm({ questionId, parentId, onSubmit, onCancel, placeholder = "Write your answer..." }: CommentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  async function handleSubmit(data: CommentFormValues) {
    if (!user) {
      toast({ title: "Not Signed In", description: "Please sign in to post an answer.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data.content, parentId); // Pass parentId to the onSubmit prop
      form.reset(); 
      toast({ title: "Answer Posted!", description: "Your answer has been added."});
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({ title: "Error", description: "Could not post your answer.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    // The parent component (QuestionDetailPage) already handles showing a sign-in prompt
    return null; 
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 border-t border-b glass-card p-4 rounded-md">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Your Answer</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="resize-y min-h-[100px] bg-background/70 focus:bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Posting...' : (parentId ? 'Post Reply' : 'Post Your Answer')}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
