"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Wand2, Loader2 } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  autoTagQuestion,
  type AutoTagQuestionInput,
} from "@/ai/flows/auto-tag-question"
import { COMMUNITIES, DEFAULT_COMMUNITY_ID } from "@/lib/constants"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addQuestion } from "@/lib/services/questionService"
import { idToken } from "@/lib/client-auth"
import Markdown from "@/components/Markdown"

const questionFormSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters.")
    .max(150, "Title too long."),
  content: z
    .string()
    .min(20, "Question content must be at least 20 characters.")
    .max(10000, "Content too long."),
  tags: z
    .array(z.string())
    .min(1, "Please add at least one tag.")
    .max(5, "Maximum 5 tags allowed."),
  communityId: z.string({ required_error: "Please select a community." }),
})

type QuestionFormValues = z.infer<typeof questionFormSchema>

export default function QuestionForm({
  defaultCommunity,
}: {
  defaultCommunity?: string | null
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isTaggingAi, setIsTaggingAi] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
      communityId:
        COMMUNITIES.find((c) => c.id === defaultCommunity && c.id !== "all")
          ?.id ??
        (DEFAULT_COMMUNITY_ID === "all"
          ? COMMUNITIES.find((c) => c.id !== "all")?.id || ""
          : DEFAULT_COMMUNITY_ID),
    },
  })

  const handleAddTag = () => {
    if (
      tagInput.trim() !== "" &&
      !currentTags.includes(tagInput.trim()) &&
      currentTags.length < 5
    ) {
      const newTags = [...currentTags, tagInput.trim().toLowerCase()]
      setCurrentTags(newTags)
      form.setValue("tags", newTags, { shouldValidate: true })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((tag) => tag !== tagToRemove)
    setCurrentTags(newTags)
    form.setValue("tags", newTags, { shouldValidate: true })
  }

  const handleAutoTag = async () => {
    const questionContent = form.getValues("content")
    if (!questionContent || questionContent.trim().length < 20) {
      toast.error("Content too short", {
        description: "Please write more content before auto-tagging.",
      })
      return
    }
    setIsTaggingAi(true)
    try {
      const input: AutoTagQuestionInput = { question: questionContent }
      const result = await autoTagQuestion(await idToken(), input)
      if (result && result.tags) {
        const suggestedAITags = result.tags.map((tag) => tag.toLowerCase())
        const mergedTags = Array.from(
          new Set([...currentTags, ...suggestedAITags])
        ).slice(0, 5)
        setCurrentTags(mergedTags)
        form.setValue("tags", mergedTags, { shouldValidate: true })
        toast.success("Tags suggested", {
          description: "AI has suggested tags based on your content.",
        })
      }
    } catch (error) {
      console.error("Error auto-tagging:", error)
      toast.error("Auto-tagging failed", {
        description: "Could not suggest tags at this time.",
      })
    } finally {
      setIsTaggingAi(false)
    }
  }

  async function onSubmit(data: QuestionFormValues) {
    if (!user) {
      toast.error("Authentication Error", {
        description: "You must be signed in to ask a question.",
      })
      return
    }
    setIsSubmitting(true)
    try {
      await addQuestion(await idToken(), data)
      toast.success("Question Posted!", {
        description: "Your question has been successfully posted to the forum.",
      })
      router.push("/qna")
      router.refresh()
    } catch (error) {
      console.error("Error submitting question:", error)
      toast.error("Error", {
        description: "Could not post your question. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. How do I set up a Python virtual environment on Windows?"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific and imagine you&apos;re asking a question to another
                person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Details</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreview((v) => !v)}
                >
                  {preview ? "Edit" : "Preview"}
                </Button>
              </div>
              {preview ? (
                <div className="min-h-[150px] rounded-md border p-3">
                  {field.value.trim() ? (
                    <Markdown>{field.value}</Markdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              ) : (
                <FormControl>
                  <Textarea
                    placeholder="Elaborate on your question. Include any code snippets, error messages, or context that might help others understand and answer."
                    className="min-h-[150px] resize-y font-mono text-sm"
                    {...field}
                  />
                </FormControl>
              )}
              <FormDescription>
                Markdown supported: **bold**, `inline code`, and fenced code
                blocks with a language, like ```python.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="communityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick the closest community" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMUNITIES.filter((c) => c.id !== "all").map(
                    (community) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    )
                  )}
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
          <div className="mb-2 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Add a tag, e.g. python"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-grow"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              disabled={currentTags.length >= 5 || tagInput.trim() === ""}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoTag}
              disabled={isTaggingAi}
            >
              {isTaggingAi ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Suggest tags
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="px-2 py-1 font-mono text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <FormField
            control={form.control}
            name="tags"
            render={() => <FormMessage className="mt-1" />}
          />
          <FormDescription>
            Up to five tags. Press Enter to add one.
          </FormDescription>
        </FormItem>

        <Button
          type="submit"
          disabled={isSubmitting || !user}
          className="w-full sm:w-auto"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user
            ? isSubmitting
              ? "Posting..."
              : "Post question"
            : "Sign in to post"}
        </Button>
      </form>
    </Form>
  )
}
