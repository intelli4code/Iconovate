'use server';

/**
 * @fileOverview An AI-powered competitor branding analyzer.
 *
 * - analyzeCompetitor - A function that handles the analysis process.
 * - CompetitorAnalysisInput - The input type for the function.
 * - CompetitorAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompetitorAnalysisInputSchema = z.object({
  competitorWebsiteUrl: z.string().url().describe('The URL of the competitor’s website.'),
});
export type CompetitorAnalysisInput = z.infer<typeof CompetitorAnalysisInputSchema>;

const CompetitorAnalysisOutputSchema = z.object({
  visualStyleAnalysis: z.string().describe("An analysis of the competitor's visual branding, including color palette, typography, imagery, and overall aesthetic."),
  toneOfVoiceAnalysis: z.string().describe("An analysis of the competitor's brand voice and communication style, including examples."),
  marketPositioning: z.string().describe("An analysis of the competitor's likely market positioning and target audience based on their branding."),
});
export type CompetitorAnalysisOutput = z.infer<typeof CompetitorAnalysisOutputSchema>;

export async function analyzeCompetitor(input: CompetitorAnalysisInput): Promise<CompetitorAnalysisOutput> {
  return competitorAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'competitorAnalyzerPrompt',
  input: { schema: CompetitorAnalysisInputSchema },
  output: { schema: CompetitorAnalysisOutputSchema },
  prompt: `You are an expert brand strategist. Based on all publicly available information about the company at the website URL provided, conduct a thorough branding analysis.

**Competitor Website:** {{{competitorWebsiteUrl}}}

Please analyze the following aspects and provide detailed insights for each:
1.  **Visual Style Analysis:** Describe their use of color, typography, logo, and imagery. What is the overall aesthetic (e.g., minimalist, corporate, playful)?
2.  **Tone of Voice Analysis:** How do they communicate? Is their language formal, casual, witty, technical? Provide examples from their website copy if possible.
3.  **Market Positioning:** Based on their branding, who do you think is their target audience? What is their key value proposition? How do they position themselves in the market (e.g., luxury, budget-friendly, innovative)?`,
});

const competitorAnalyzerFlow = ai.defineFlow(
  {
    name: 'competitorAnalyzerFlow',
    inputSchema: CompetitorAnalysisInputSchema,
    outputSchema: CompetitorAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
