'use server';

/**
 * @fileOverview An AI-powered brand guidelines generator.
 *
 * - generateBrandGuidelines - A function that handles the brand guidelines generation process.
 * - BrandGuidelinesInput - The input type for the generateBrandGuidelines function.
 * - BrandGuidelinesOutput - The return type for the generateBrandGuidelines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BrandGuidelinesInputSchema = z.object({
  brandName: z.string().describe('The name of the brand.'),
  logoDescription: z.string().describe('A description of the brand’s logo.'),
  colorPalette: z.string().describe('The primary and secondary colors for the brand, preferably with hex codes (e.g., #FFFFFF, #000000).'),
  typography: z.string().describe('The fonts used for headings and body text.'),
  brandVoice: z.string().describe('A description of the brand’s tone of voice (e.g., professional, playful, formal).'),
});
export type BrandGuidelinesInput = z.infer<typeof BrandGuidelinesInputSchema>;

const BrandGuidelinesOutputSchema = z.object({
  logoUsage: z.string().describe('Guidelines on how to use the logo, including clear space, minimum size, and incorrect usage examples.'),
  colorSystem: z.string().describe('A detailed breakdown of the color palette, including primary, secondary, and accent colors with their roles and codes (HEX, RGB, CMYK).'),
  typographyGuidelines: z.string().describe('Rules for typography, including font families, weights, sizes, and line heights for different text elements like headings and paragraphs.'),
  imageryStyle: z.string().describe('A description of the recommended style for photography and illustrations to maintain brand consistency.'),
  brandVoice: z.string().describe('An elaboration on the brand’s tone of voice with examples of how to apply it in communication.'),
});
export type BrandGuidelinesOutput = z.infer<typeof BrandGuidelinesOutputSchema>;

export async function generateBrandGuidelines(input: BrandGuidelinesInput): Promise<BrandGuidelinesOutput> {
  return brandGuidelinesGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'brandGuidelinesPrompt',
  input: {schema: BrandGuidelinesInputSchema},
  output: {schema: BrandGuidelinesOutputSchema},
  prompt: `You are an expert brand strategist who creates comprehensive and professional brand identity guidelines.

Based on the following information, generate a complete set of brand guidelines. Each section should be detailed, practical, and easy to understand.

**Brand Name:** {{{brandName}}}
**Logo Description:** {{{logoDescription}}}
**Color Palette:** {{{colorPalette}}}
**Typography:** {{{typography}}}
**Brand Voice:** {{{brandVoice}}}

Please generate the content for the following sections:
1.  **Logo Usage:** Create rules for clear space, minimum size, and show examples of incorrect usage.
2.  **Color System:** Define the primary, secondary, and accent colors. Provide their HEX, RGB, and CMYK values and explain their intended use.
3.  **Typography Guidelines:** Specify the font families, weights, and sizes for headings (H1, H2, H3) and body text. Include line height and character spacing recommendations.
4.  **Imagery Style:** Describe the appropriate style for photography and illustrations that will align with the brand.
5.  **Brand Voice:** Elaborate on the provided tone of voice, giving examples of "do's" and "don'ts".`,
});

const brandGuidelinesGeneratorFlow = ai.defineFlow(
  {
    name: 'brandGuidelinesGeneratorFlow',
    inputSchema: BrandGuidelinesInputSchema,
    outputSchema: BrandGuidelinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
