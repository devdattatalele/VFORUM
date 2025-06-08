"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Tag as TagIcon, Wand2, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { autoTagQuestion, type AutoTagQuestionInput } from "@/ai/flows/auto-tag-question";
import { COMMUNITIES, DEFAULT_COMMUNITY_ID } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const questionFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters.").max(150, "Title too long."),
  content: z.string().min(20, "Question content must be at least 20 characters.").max(5000, "Content too long."),
  tags: z.array(z.string()).min(1, "Please add at least one tag.").max(5, "Maximum 5 tags allowed."),
  communityId: z.string({ required_error: "Please select a community." }),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function QuestionForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTaggingAi, setIsTaggingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
      communityId: DEFAULT_COMMUNITY_ID,
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !currentTags.includes(tagInput.trim()) && currentTags.length < 5) {
      const newTags = [...currentTags, tagInput.trim()];
      setCurrentTags(newTags);
      form.setValue("tags", newTags, { shouldValidate: true });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(newTags);
    form.setValue("tags", newTags, { shouldValidate: true });
  };

  const handleAutoTag = async () => {
    const questionContent = form.getValues("content");
    if (!questionContent || questionContent.trim().length < 20) {
      toast({ title: "Content too short", description: "Please write more content before auto-tagging.", variant: "destructive" });
      return;
    }
    setIsTaggingAi(true);
    try {
      const input: AutoTagQuestionInput = { question: questionContent };
      const result = await autoTagQuestion(input);
      if (result && result.tags) {
        const mergedTags = Array.from(new Set([...currentTags, ...result.tags])).slice(0, 5);
        setCurrentTags(mergedTags);
        form.setValue("tags", mergedTags, { shouldValidate: true });
        toast({ title: "Tags Suggested!", description: "AI has suggested tags based on your content." });
      }
    } catch (error) {
      console.error("Error auto-tagging:", error);
      toast({ title: "Auto-tagging failed", description: "Could not suggest tags at this time.", variant: "destructive" });
    } finally {
      setIsTaggingAi(false);
    }
  };


  async function onSubmit(data: QuestionFormValues) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be signed in to ask a question.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    console.log("Question submitted:", { ...data, author: user });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Question Posted!",
      description: "Your question has been successfully posted to the forum.",
    });
    setIsSubmitting(false);
    router.push('/qna'); // Redirect to Q&A page
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., How to set up a Python virtual environment on Windows?" {...field} />
              </FormControl>
              <FormDescription>Be specific and imagine you're asking a question to another person.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Elaborate on your question. Include any code snippets, error messages, or context that might help others understand and answer."
                  className="resize-y min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="communityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community Channel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the most relevant community for your question" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMUNITIES.filter(c => c.id !== 'all').map((community) => ( // Exclude "All Communities" for posting
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This helps categorize your question.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="text"
              placeholder="Add a tag (e.g., python, react)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
              className="flex-grow"
            />
            <Button type="button" variant="outline" onClick={handleAddTag} disabled={currentTags.length >= 5}>Add Tag</Button>
            <Button type="button" variant="outline" onClick={handleAutoTag} disabled={isTaggingAi}>
              {isTaggingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              AI Suggest
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentTags.map(tag => (
              <Badge key={tag} variant="secondary" className="py-1 px-2 text-sm">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 p-0.5 rounded-full hover:bg-muted-foreground/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
           <FormField
            control={form.control}
            name="tags"
            render={() => ( <FormMessage className="mt-1"/>)} // To display validation errors for tags array
            />
          <FormDescription>Add up to 5 tags to describe what your question is about. Press Enter or click "Add Tag".</FormDescription>
        </FormItem>

        <Button type="submit" disabled={isSubmitting || !user} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user ? (isSubmitting ? 'Posting...' : 'Post Your Question') : 'Sign in to Post'}
        </Button>
      </form>
    </Form>
  );
}
