'use server';
/**
 * @fileOverview An AI-powered logo concept generator.
 *
 * - generateLogoConcept - A function that handles the logo concept generation process.
 * - LogoConceptInput - The input type for the generateLogoConcept function.
 * - LogoConceptOutput - The return type for the generateLogoConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogoConceptInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the logo to be generated. Include company name, style (e.g., minimalist, vintage), elements, and color preferences.'),
});
export type LogoConceptInput = z.infer<typeof LogoConceptInputSchema>;

const LogoConceptOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated logo concept image, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type LogoConceptOutput = z.infer<typeof LogoConceptOutputSchema>;

export async function generateLogoConcept(input: LogoConceptInput): Promise<LogoConceptOutput> {
  return logoGeneratorFlow(input);
}

const logoGeneratorFlow = ai.defineFlow(
  {
    name: 'logoGeneratorFlow',
    inputSchema: LogoConceptInputSchema,
    outputSchema: LogoConceptOutputSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a high-quality, modern, vector-style logo based on the following description. The logo should be on a plain white background. Description: "${prompt}"`,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to return media.');
    }

    return { imageDataUri: media.url };
  }
);
