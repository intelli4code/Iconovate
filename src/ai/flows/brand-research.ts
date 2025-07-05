'use server';

/**
 * @fileOverview An AI-powered brand research agent.
 *
 * - brandResearch - A function that handles the brand research process.
 * - BrandResearchInput - The input type for the brandResearch function.
 * - BrandResearchOutput - The return type for the brandResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BrandResearchInputSchema = z.object({
  brandName: z.string().describe('The name of the brand to research.'),
  industry: z.string().describe('The industry the brand operates in.'),
  targetAudience: z
    .string()
    .describe('A description of the brand’s target audience.'),
});
export type BrandResearchInput = z.infer<typeof BrandResearchInputSchema>;

const BrandResearchOutputSchema = z.object({
  marketInsights: z.string().describe('Insights into the brand’s market.'),
  competitorBrandingAnalysis: z
    .string()
    .describe('An analysis of competitor branding, including visual styles.'),
  moodBoardDescription: z
    .string()
    .describe(
      'A description of a data-driven mood board with suggested visual styles, color schemes, and imagery.'
    ),
});
export type BrandResearchOutput = z.infer<typeof BrandResearchOutputSchema>;

export async function brandResearch(input: BrandResearchInput): Promise<BrandResearchOutput> {
  return brandResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'brandResearchPrompt',
  input: {schema: BrandResearchInputSchema},
  output: {schema: BrandResearchOutputSchema},
  prompt: `You are an expert brand strategist. Conduct thorough research on the following brand, industry, and target audience, and provide market insights, competitor branding analysis, and a data-driven mood board description.

Brand Name: {{{brandName}}}
Industry: {{{industry}}}
Target Audience: {{{targetAudience}}}

Format your response as follows:

**Market Insights:** [Provide detailed insights into the brand's market, including trends, challenges, and opportunities.]

**Competitor Branding Analysis:** [Analyze the branding of key competitors, focusing on visual styles, logos, color palettes, and typography.]

**Mood Board Description:** [Describe a data-driven mood board with suggested visual styles, color schemes, and imagery that would resonate with the target audience and align with the brand's positioning.]`,
});

const brandResearchFlow = ai.defineFlow(
  {
    name: 'brandResearchFlow',
    inputSchema: BrandResearchInputSchema,
    outputSchema: BrandResearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
