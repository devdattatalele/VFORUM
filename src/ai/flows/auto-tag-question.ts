"use server"

import type { IdToken } from "@/lib/types"
/**
 * @fileOverview A flow that automatically suggests relevant tags for a question based on its content.
 *
 * - autoTagQuestion - A function that handles the auto-tagging process.
 * - AutoTagQuestionInput - The input type for the autoTagQuestion function.
 * - AutoTagQuestionOutput - The return type for the autoTagQuestion function.
 */

import { ai } from "@/ai/genkit"
import { requireUser } from "@/lib/server/auth"
import { z } from "genkit"

const AutoTagQuestionInputSchema = z.object({
  question: z.string().describe("The question to be tagged."),
})
export type AutoTagQuestionInput = z.infer<typeof AutoTagQuestionInputSchema>

const AutoTagQuestionOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe("An array of suggested tags for the question."),
})
export type AutoTagQuestionOutput = z.infer<typeof AutoTagQuestionOutputSchema>

// Calls Gemini, which costs money, so only signed-in students may use it.
export async function autoTagQuestion(
  idToken: IdToken,
  input: AutoTagQuestionInput
): Promise<AutoTagQuestionOutput> {
  await requireUser(idToken)
  const question = String(input?.question ?? "").slice(0, 5000)
  return autoTagQuestionFlow({ question })
}

const prompt = ai.definePrompt({
  name: "autoTagQuestionPrompt",
  input: { schema: AutoTagQuestionInputSchema },
  output: { schema: AutoTagQuestionOutputSchema },
  prompt: `Suggest relevant tags for the following question. Return a JSON array of strings.

Question: {{{question}}}`,
})

const autoTagQuestionFlow = ai.defineFlow(
  {
    name: "autoTagQuestionFlow",
    inputSchema: AutoTagQuestionInputSchema,
    outputSchema: AutoTagQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input)
    return output!
  }
)
