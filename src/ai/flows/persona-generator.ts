
'use server';

/**
 * @fileOverview An AI-powered user persona generator.
 *
 * - generatePersonas - A function that generates user personas.
 * - PersonaGeneratorInput - The input type for the function.
 * - PersonaGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonaGeneratorInputSchema = z.object({
  brandDescription: z.string().describe('A description of the brand and its target market.'),
});
export type PersonaGeneratorInput = z.infer<typeof PersonaGeneratorInputSchema>;

const PersonaSchema = z.object({
    name: z.string().describe("The persona's full name."),
    demographics: z.string().describe("The persona's age, location, occupation, and income."),
    goals: z.string().describe("A summary of what this persona wants to achieve in relation to the brand."),
    motivations: z.string().describe("A summary of the driving forces behind the persona's goals and behavior."),
});

const PersonaGeneratorOutputSchema = z.object({
  personas: z.array(PersonaSchema).length(3).describe('An array of exactly 3 detailed user personas.'),
});
export type PersonaGeneratorOutput = z.infer<typeof PersonaGeneratorOutputSchema>;

export async function generatePersonas(input: PersonaGeneratorInput): Promise<PersonaGeneratorOutput> {
  return personaGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personaGeneratorPrompt',
  input: { schema: PersonaGeneratorInputSchema },
  output: { schema: PersonaGeneratorOutputSchema },
  prompt: `You are an expert market researcher and brand strategist. Based on the following brand description, create 3 distinct and detailed user personas.

**Brand Description:**
{{{brandDescription}}}

For each persona, include:
- A realistic name.
- Key demographics (age, location, occupation, income).
- Their primary goals as they relate to this type of brand or product.
- Their core motivations and frustrations.`,
});

const personaGeneratorFlow = ai.defineFlow(
  {
    name: 'personaGeneratorFlow',
    inputSchema: PersonaGeneratorInputSchema,
    outputSchema: PersonaGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
