"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionEditFormProps {
  initialData: {
    title: string;
    content: string;
    tags: string[];
  };
  onSubmit: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

const questionEditSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title is too long"),
  content: z.string().min(20, "Content must be at least 20 characters").max(5000, "Content is too long"),
  tagInput: z.string().optional(),
});

type QuestionEditValues = z.infer<typeof questionEditSchema>;

export default function QuestionEditForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  className 
}: QuestionEditFormProps) {
  const [tags, setTags] = useState<string[]>(initialData.tags);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionEditValues>({
    resolver: zodResolver(questionEditSchema),
    defaultValues: {
      title: initialData.title,
      content: initialData.content,
      tagInput: "",
    },
  });

  const handleAddTag = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      form.setValue("tagInput", "");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagInput = form.getValues("tagInput");
      if (tagInput) {
        handleAddTag(tagInput);
      }
    }
  };

  async function handleSubmit(data: QuestionEditValues) {
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: data.title,
        content: data.content,
        tags,
      });
    } catch (error) {
      console.error("Error updating question:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("space-y-4 p-4 border rounded-lg bg-background", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Question</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="What's your question?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide more details about your question..."
                    className="resize-none min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (max 5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <FormField
              control={form.control}
              name="tagInput"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Add tags (press Enter or comma to add)"
                      {...field}
                      onKeyDown={handleTagKeyDown}
                      disabled={tags.length >= 5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 