"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const schema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(5000, "Keep it under 5,000 characters."),
})

// Answer, reply and edit box. Collapsed until used; the parent's onSubmit
// throws on failure and the error is shown here.
export default function CompactCommentForm({
  onSubmit,
  onCancel,
  placeholder = "Write an answer",
  submitLabel = "Post",
  initialContent = "",
  startOpen = false,
  className,
}: {
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  placeholder?: string
  submitLabel?: string
  initialContent?: string
  startOpen?: boolean
  className?: string
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(startOpen || !!initialContent)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { content: initialContent },
  })
  const length = form.watch("content").length

  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  if (!user) {
    return (
      <p
        className={cn(
          "rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground",
          className
        )}
      >
        <Link
          href="/auth"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>{" "}
        to answer.
      </p>
    )
  }

  const cancel = () => {
    form.reset({ content: initialContent })
    setOpen(false)
    onCancel?.()
  }

  const submit = async ({ content }: z.infer<typeof schema>) => {
    try {
      await onSubmit(content)
      form.reset({ content: "" })
      setOpen(false)
    } catch {
      toast.error("Could not save that", {
        description: "The question may be locked, or you were signed out.",
      })
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full rounded-lg border bg-background px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/30",
          className
        )}
      >
        {placeholder}
      </button>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className={cn(
          "space-y-3 rounded-lg border bg-background p-3",
          className
        )}
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  aria-label={placeholder}
                  placeholder={placeholder}
                  className="min-h-[100px] resize-y border-0 p-0 font-mono text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  {...field}
                  ref={(el) => {
                    field.ref(el)
                    textareaRef.current = el
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="font-mono text-xs text-muted-foreground">
            {length}/5000 · Markdown supported
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={form.formState.isSubmitting}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
