
'use server';
/**
 * @fileOverview An AI-powered visual style synthesizer.
 *
 * - synthesizeVisuals - A function that analyzes selected images and creates a visual direction.
 * - VisualSynthesisInput - The input type for the function.
 * - VisualSynthesisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualSynthesisInputSchema = z.object({
  images: z.array(z.object({
      url: z.string().describe("An image as a data URI."),
      prompt: z.string().describe("The prompt used to generate the image.")
  })).min(3, "At least 3 images are required.").describe("An array of images the user has selected."),
});
export type VisualSynthesisInput = z.infer<typeof VisualSynthesisInputSchema>;

const VisualSynthesisOutputSchema = z.object({
  visualDirection: z.string().describe('A detailed summary of the synthesized visual direction, including themes, color palettes, textures, and overall mood.'),
  styleKeywords: z.array(z.string()).describe('A list of keywords that describe the visual style (e.g., "Minimalist", "Organic", "Vibrant").'),
});
export type VisualSynthesisOutput = z.infer<typeof VisualSynthesisOutputSchema>;

export async function synthesizeVisuals(input: VisualSynthesisInput): Promise<VisualSynthesisOutput> {
  return visualSynthesizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualSynthesizerPrompt',
  input: {schema: VisualSynthesisInputSchema},
  output: {schema: VisualSynthesisOutputSchema},
  prompt: `You are an expert creative director. A client has selected a few images that they feel represent their brand.
Analyze the following images and their original prompts to synthesize a coherent and compelling visual direction.

Identify common themes, color palettes, textures, moods, and overall aesthetics.
Based on your analysis, provide a detailed summary of the recommended "Visual Direction" and a list of keywords that encapsulate this style.

Selected Images:
{{#each images}}
---
Image Prompt: {{{this.prompt}}}
Image: {{media url=this.url}}
---
{{/each}}
`,
});

const visualSynthesizerFlow = ai.defineFlow(
  {
    name: 'visualSynthesizerFlow',
    inputSchema: VisualSynthesisInputSchema,
    outputSchema: VisualSynthesisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
