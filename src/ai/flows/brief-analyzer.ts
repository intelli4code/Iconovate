'use server';

/**
 * @fileOverview An AI-powered project brief analyzer.
 *
 * - analyzeBrief - A function that analyzes a client brief.
 * - BriefAnalysisInput - The input type for the function.
 * - BriefAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BriefAnalysisInputSchema = z.object({
  brief: z.string().describe('The full text of the client’s project brief.'),
});
export type BriefAnalysisInput = z.infer<typeof BriefAnalysisInputSchema>;

const BriefAnalysisOutputSchema = z.object({
  timeline: z.string().describe('A suggested project timeline with key phases and estimated durations.'),
  risks: z.string().describe('A list of potential risks or challenges based on the brief.'),
  questions: z.string().describe('A list of clarifying questions to ask the client to ensure project success.'),
});
export type BriefAnalysisOutput = z.infer<typeof BriefAnalysisOutputSchema>;

export async function analyzeBrief(input: BriefAnalysisInput): Promise<BriefAnalysisOutput> {
  return briefAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'briefAnalyzerPrompt',
  input: { schema: BriefAnalysisInputSchema },
  output: { schema: BriefAnalysisOutputSchema },
  prompt: `You are an expert project manager for a design agency. Analyze the following client brief and provide a structured analysis.

**Client Brief:**
{{{brief}}}

Based on the brief, generate the following:
1.  **Suggested Timeline:** Create a high-level timeline with key project phases (e.g., Discovery, Design, Development, Launch) and estimated durations for each.
2.  **Potential Risks:** Identify potential risks, ambiguities, or challenges that might arise from this brief.
3.  **Clarifying Questions:** Formulate a list of important questions to ask the client to get more clarity and ensure the project is well-defined.`,
});

const briefAnalyzerFlow = ai.defineFlow(
  {
    name: 'briefAnalyzerFlow',
    inputSchema: BriefAnalysisInputSchema,
    outputSchema: BriefAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
