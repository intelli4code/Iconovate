
'use server';

/**
 * @fileOverview An AI-powered brand archetype analyzer.
 *
 * - analyzeArchetype - A function that analyzes answers to determine a brand archetype.
 * - ArchetypeAnalysisInput - The input type for the function.
 * - ArchetypeAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArchetypeAnalysisInputSchema = z.object({
  answers: z.array(z.string()).length(5).describe('An array of 5 answers to the brand archetype questionnaire.'),
});
export type ArchetypeAnalysisInput = z.infer<typeof ArchetypeAnalysisInputSchema>;

const ArchetypeAnalysisOutputSchema = z.object({
  primaryArchetype: z.string().describe("The primary brand archetype (e.g., The Hero, The Sage)."),
  secondaryArchetype: z.string().describe("The secondary brand archetype."),
  analysis: z.string().describe("A detailed analysis of why these archetypes were chosen based on the answers."),
  toneAndStyle: z.string().describe("Guidance on the brand's tone of voice and visual style based on the archetypes."),
});
export type ArchetypeAnalysisOutput = z.infer<typeof ArchetypeAnalysisOutputSchema>;

export async function analyzeArchetype(input: ArchetypeAnalysisInput): Promise<ArchetypeAnalysisOutput> {
  return archetypeAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'archetypeAnalyzerPrompt',
  input: { schema: ArchetypeAnalysisInputSchema },
  output: { schema: ArchetypeAnalysisOutputSchema },
  prompt: `You are an expert brand strategist specializing in brand archetypes. Based on the 12 classic brand archetypes (The Innocent, Everyman, Hero, Outlaw, Explorer, Creator, Ruler, Magician, Lover, Caregiver, Jester, Sage), analyze the following answers to a brand questionnaire.

Determine the primary and secondary archetypes for the brand. Provide a detailed analysis explaining your choices and offer guidance on the appropriate tone of voice and visual style that aligns with these archetypes.

Questionnaire Answers:
1. How does your brand solve a problem for customers?
   - {{{answers.0}}}
2. What is your brand's personality?
   - {{{answers.1}}}
3. What is your company culture like?
   - {{{answers.2}}}
4. Who are your biggest competitors and how are you different?
   - {{{answers.3}}}
5. What do you want customers to feel when they interact with your brand?
   - {{{answers.4}}}

Please provide a full analysis.`,
});

const archetypeAnalyzerFlow = ai.defineFlow(
  {
    name: 'archetypeAnalyzerFlow',
    inputSchema: ArchetypeAnalysisInputSchema,
    outputSchema: ArchetypeAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
