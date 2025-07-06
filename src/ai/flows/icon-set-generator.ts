'use server';

/**
 * @fileOverview An AI-powered icon set generator.
 *
 * - generateIconSet - A function that handles the icon set generation process.
 * - IconSetGeneratorInput - The input type for the generateIconSet function.
 * - IconSetGeneratorOutput - The return type for the generateIconSet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IconSetGeneratorInputSchema = z.object({
  style: z.string().describe('A detailed description of the visual style for the icon set (e.g., "minimalist line art", "3D clay render", "flat color with long shadows").'),
  concepts: z.string().describe("A comma-separated list of concepts for the icons (e.g., 'user, settings, home, mail, search'). Maximum of 8 concepts."),
});
export type IconSetGeneratorInput = z.infer<typeof IconSetGeneratorInputSchema>;

const IconSetGeneratorOutputSchema = z.object({
  icons: z.array(
    z.object({
      concept: z.string().describe('The concept for the icon.'),
      imageDataUri: z.string().describe('The generated icon image, as a data URI.'),
    })
  ).describe('An array of generated icons.'),
});
export type IconSetGeneratorOutput = z.infer<typeof IconSetGeneratorOutputSchema>;

export async function generateIconSet(input: IconSetGeneratorInput): Promise<IconSetGeneratorOutput> {
  return iconSetGeneratorFlow(input);
}

const iconSetGeneratorFlow = ai.defineFlow(
  {
    name: 'iconSetGeneratorFlow',
    inputSchema: IconSetGeneratorInputSchema,
    outputSchema: IconSetGeneratorOutputSchema,
  },
  async ({ style, concepts }) => {
    const conceptList = concepts.split(',').map(c => c.trim()).filter(Boolean).slice(0, 8); // Limit to 8 concepts

    const imagePromises = conceptList.map(async (concept) => {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A single, professional-grade UI icon of a "${concept}".
        Style: "${style}".
        The icon must be on a plain, solid white background.
        It must be centered and visually balanced.
        Ensure it maintains a consistent visual language suitable for a cohesive icon set.`,
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      if (!media?.url) {
        console.warn(`An icon failed to generate for the concept: ${concept}`);
        return {
          concept,
          imageDataUri: 'https://placehold.co/256x256', // Placeholder for failed generation
        };
      }

      return {
        concept,
        imageDataUri: media.url,
      };
    });

    const icons = await Promise.all(imagePromises);

    return { icons };
  }
);
