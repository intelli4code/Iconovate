'use server';

/**
 * @fileOverview An AI-powered mood board generator.
 *
 * - generateMoodBoard - A function that handles the mood board generation process.
 * - MoodBoardInput - The input type for the generateMoodBoard function.
 * - MoodBoardOutput - The return type for the generateMoodBoard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodBoardInputSchema = z.object({
  description: z.string().describe('A description of the brand’s vibe, industry, or desired aesthetic.'),
});
export type MoodBoardInput = z.infer<typeof MoodBoardInputSchema>;

// Internal schema for the prompt that generates image prompts
const ImagePromptsOutputSchema = z.object({
    imagePrompts: z
        .array(z.string().describe('A detailed, specific prompt for an image generation AI.'))
        .length(6)
        .describe('An array of exactly 6 distinct prompts for an image generation AI to create a visual mood board. Each prompt should describe a single, cohesive image representing a different facet of the brand identity (e.g., one for color, one for texture, one for lifestyle, one for typography style, one for an abstract concept, one for a product feel).'),
});


const MoodBoardOutputSchema = z.object({
  moodBoardImages: z.array(z.string()).describe('An array of 6 image data URIs for the mood board.'),
});
export type MoodBoardOutput = z.infer<typeof MoodBoardOutputSchema>;

export async function generateMoodBoard(input: MoodBoardInput): Promise<MoodBoardOutput> {
  return moodBoardGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodBoardImagePrompts',
  input: {schema: MoodBoardInputSchema},
  output: {schema: ImagePromptsOutputSchema},
  prompt: `You are an expert brand strategist and creative director. Based on the following description, create 6 distinct, detailed prompts for an image generation AI.

Each prompt should result in a photorealistic and aesthetically pleasing image that captures a specific element of the brand's essence. The prompts should cover a range of concepts like textures, environments, lifestyle scenes, abstract representations of feelings, and potential product applications that align with the core description.

Brand Description: {{{description}}}

Generate exactly 6 detailed and unique image prompts.`,
});

const moodBoardGeneratorFlow = ai.defineFlow(
  {
    name: 'moodBoardGeneratorFlow',
    inputSchema: MoodBoardInputSchema,
    outputSchema: MoodBoardOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate image prompts.');
    }

    const imagePromises = output.imagePrompts.map(imagePrompt =>
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Photorealistic image for a brand mood board, representing the concept: "${imagePrompt}"`,
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      })
    );

    const imageResults = await Promise.all(imagePromises);
    
    const moodBoardImages = imageResults.map(result => {
      if (!result.media?.url) {
        console.warn('An image failed to generate for the mood board.');
        return 'https://placehold.co/400x400';
      }
      return result.media.url;
    });

    return { moodBoardImages };
  }
);
