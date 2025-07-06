'use server';

/**
 * @fileOverview An AI-powered slogan and tagline generator.
 *
 * - generateSlogans - A function that handles the slogan generation process.
 * - SloganGeneratorInput - The input type for the generateSlogans function.
 * - SloganGeneratorOutput - The return type for the generateSlogans function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SloganGeneratorInputSchema = z.object({
  brandDescription: z.string().describe("A detailed description of the brand, its values, and what it does."),
  keywords: z.string().optional().describe("A comma-separated list of keywords to inspire the slogans."),
});
export type SloganGeneratorInput = z.infer<typeof SloganGeneratorInputSchema>;

const SloganGeneratorOutputSchema = z.object({
  slogans: z.array(z.string()).describe("A list of 10 creative and catchy slogans or taglines for the brand."),
});
export type SloganGeneratorOutput = z.infer<typeof SloganGeneratorOutputSchema>;

export async function generateSlogans(input: SloganGeneratorInput): Promise<SloganGeneratorOutput> {
  return sloganGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sloganGeneratorPrompt',
  input: { schema: SloganGeneratorInputSchema },
  output: { schema: SloganGeneratorOutputSchema },
  prompt: `You are an expert branding copywriter specializing in creating memorable slogans and taglines.

Based on the following brand information, generate a list of 10 unique and compelling slogans. The slogans should be concise, catchy, and align with the brand's identity.

**Brand Description:** {{{brandDescription}}}

{{#if keywords}}
**Inspirational Keywords:** {{{keywords}}}
{{/if}}

Please generate exactly 10 slogans.`,
});

const sloganGeneratorFlow = ai.defineFlow(
  {
    name: 'sloganGeneratorFlow',
    inputSchema: SloganGeneratorInputSchema,
    outputSchema: SloganGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
