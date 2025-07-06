'use server';

/**
 * @fileOverview An AI-powered typography pairing suggestion tool.
 *
 * - generateTypographyPairing - Suggests font pairings from Google Fonts.
 * - TypographyPairingInput - The input type for the function.
 * - TypographyPairingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TypographyPairingInputSchema = z.object({
  brandVibe: z.string().describe("A description of the brand's vibe, feeling, or industry (e.g., 'tech startup, innovative, trustworthy', 'luxury fashion, elegant, classic')."),
});
export type TypographyPairingInput = z.infer<typeof TypographyPairingInputSchema>;

const TypographyPairingOutputSchema = z.object({
  pairings: z
    .array(
      z.object({
        headlineFont: z.string().describe("The suggested Google Font for headlines."),
        bodyFont: z.string().describe("The suggested Google Font for body text."),
        rationale: z.string().describe("A brief explanation of why this font pairing works for the described brand vibe."),
      })
    )
    .length(3)
    .describe('An array of exactly 3 distinct typography pairing suggestions.'),
});
export type TypographyPairingOutput = z.infer<typeof TypographyPairingOutputSchema>;

export async function generateTypographyPairing(input: TypographyPairingInput): Promise<TypographyPairingOutput> {
  return typographyPairingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'typographyPairingPrompt',
  input: { schema: TypographyPairingInputSchema },
  output: { schema: TypographyPairingOutputSchema },
  prompt: `You are an expert typographer and brand designer with deep knowledge of Google Fonts.

Based on the following brand vibe, suggest 3 distinct and professional font pairings. For each pairing, provide a headline font, a body font, and a short rationale explaining why the combination is effective for the brand.

Brand Vibe: {{{brandVibe}}}

Ensure all suggested fonts are available on Google Fonts.`,
});

const typographyPairingFlow = ai.defineFlow(
  {
    name: 'typographyPairingFlow',
    inputSchema: TypographyPairingInputSchema,
    outputSchema: TypographyPairingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
