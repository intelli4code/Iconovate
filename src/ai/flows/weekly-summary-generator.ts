'use server';

/**
 * @fileOverview An AI-powered weekly summary email generator.
 *
 * - generateWeeklySummary - A function that drafts a client update email.
 * - WeeklySummaryInput - The input type for the function.
 * - WeeklySummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeeklySummaryInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  clientName: z.string().describe('The name of the client.'),
  completedTasks: z.string().describe('A list or summary of tasks completed this week.'),
  nextSteps: z.string().describe('A summary of the plan for the upcoming week.'),
});
export type WeeklySummaryInput = z.infer<typeof WeeklySummaryInputSchema>;

const WeeklySummaryOutputSchema = z.object({
  summaryEmail: z.string().describe('The full text of the generated weekly summary email, formatted nicely.'),
});
export type WeeklySummaryOutput = z.infer<typeof WeeklySummaryOutputSchema>;

export async function generateWeeklySummary(input: WeeklySummaryInput): Promise<WeeklySummaryOutput> {
  return weeklySummaryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weeklySummaryPrompt',
  input: { schema: WeeklySummaryInputSchema },
  output: { schema: WeeklySummaryOutputSchema },
  prompt: `You are a professional and friendly project manager at a design agency. Draft a weekly progress summary email to a client.

The email should be clear, concise, and positive.

**Client Name:** {{{clientName}}}
**Project Name:** {{{projectName}}}

**Tasks Completed This Week:**
{{{completedTasks}}}

**Plan for Next Week:**
{{{nextSteps}}}

Draft the email now. Start with a friendly greeting and end with a professional closing. Structure the body with clear headings for "Progress This Week" and "Next Steps".`,
});

const weeklySummaryGeneratorFlow = ai.defineFlow(
  {
    name: 'weeklySummaryGeneratorFlow',
    inputSchema: WeeklySummaryInputSchema,
    outputSchema: WeeklySummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
