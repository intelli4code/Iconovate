'use server';
/**
 * @fileOverview An AI-powered logo variation generator.
 *
 * - generateLogoVariation - A function that handles the logo variation generation process.
 * - LogoVariationInput - The input type for the generateLogoVariation function.
 * - LogoVariationOutput - The return type for the generateLogoVariation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogoVariationInputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      "A logo image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  variationType: z.string().describe('The type of variation to generate (e.g., "Monogram", "Icon Only", "Wordmark").'),
});
export type LogoVariationInput = z.infer<typeof LogoVariationInputSchema>;

const LogoVariationOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated logo variation image, as a data URI."
    ),
});
export type LogoVariationOutput = z.infer<typeof LogoVariationOutputSchema>;

export async function generateLogoVariation(input: LogoVariationInput): Promise<LogoVariationOutput> {
  return logoVariationGeneratorFlow(input);
}

const logoVariationGeneratorFlow = ai.defineFlow(
  {
    name: 'logoVariationGeneratorFlow',
    inputSchema: LogoVariationInputSchema,
    outputSchema: LogoVariationOutputSchema,
  },
  async ({ logoDataUri, variationType }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: logoDataUri } },
        { text: `Generate a new logo that is a "${variationType}" variation of the provided logo. Maintain the same style and color scheme. The new logo must be high-quality, professional, and on a plain white background.` },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return media.');
    }

    return { imageDataUri: media.url };
  }
);
