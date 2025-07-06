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
  moodBoardImages: z.array(z.string()).describe('An array of 4 image data URIs for the mood board.'),
});
export type BrandResearchOutput = z.infer<typeof BrandResearchOutputSchema>;

// Internal schema for the text-generation prompt
const PromptOutputSchema = z.object({
   marketInsights: z.string().describe('Insights into the brand’s market.'),
  competitorBrandingAnalysis: z
    .string()
    .describe('An analysis of competitor branding, including visual styles.'),
  moodBoardDescription: z
    .string()
    .describe(
      'A description of a data-driven mood board with suggested visual styles, color schemes, and imagery.'
    ),
  moodBoardImagePrompts: z.array(z.string().describe('A detailed, specific prompt for an image generation AI.')).length(4).describe('An array of exactly 4 distinct prompts for an image generation AI to create a visual mood board. Each prompt should describe a single, cohesive image representing a different facet of the brand identity (e.g., one for color, one for texture, one for lifestyle, one for typography style).'),
});


export async function brandResearch(input: BrandResearchInput): Promise<BrandResearchOutput> {
  return brandResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'brandResearchPrompt',
  input: {schema: BrandResearchInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an expert brand strategist. Conduct thorough research on the following brand, industry, and target audience.

Brand Name: {{{brandName}}}
Industry: {{{industry}}}
Target Audience: {{{targetAudience}}}

Format your response as follows:

**Market Insights:** [Provide detailed insights into the brand's market, including trends, challenges, and opportunities.]

**Competitor Branding Analysis:** [Analyze the branding of key competitors, focusing on visual styles, logos, color palettes, and typography.]

**Mood Board Description:** [Describe a data-driven mood board with suggested visual styles, color schemes, and imagery that would resonate with the target audience and align with the brand's positioning.]

**Image Prompts:** [Based on the mood board, create exactly 4 distinct, detailed prompts for an image generation AI. Each prompt should result in a photorealistic image that captures a specific element of the brand's essence. For example, one prompt might focus on a key color in an abstract texture, another on a lifestyle scene embodying the brand's values, a third on a product in context, and a fourth on an architectural style that matches the brand's feeling.]`,
});

const brandResearchFlow = ai.defineFlow(
  {
    name: 'brandResearchFlow',
    inputSchema: BrandResearchInputSchema,
    outputSchema: BrandResearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get research data from the text prompt.');
    }

    const imagePromises = output.moodBoardImagePrompts.map(imagePrompt =>
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Photorealistic image representing this concept for a brand mood board: "${imagePrompt}"`,
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      })
    );

    const imageResults = await Promise.all(imagePromises);
    
    const moodBoardImages = imageResults.map(result => {
      if (!result.media?.url) {
        // Return a placeholder if an image fails to generate
        console.warn('An image failed to generate for the mood board.');
        return 'https://placehold.co/400x400';
      }
      return result.media.url;
    });

    return {
      marketInsights: output.marketInsights,
      competitorBrandingAnalysis: output.competitorBrandingAnalysis,
      moodBoardDescription: output.moodBoardDescription,
      moodBoardImages,
    };
  }
);
