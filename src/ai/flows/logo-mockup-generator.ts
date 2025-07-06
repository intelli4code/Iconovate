'use server';
/**
 * @fileOverview An AI-powered logo mockup generator.
 *
 * - generateLogoMockup - A function that handles the logo mockup generation process.
 * - LogoMockupInput - The input type for the generateLogoMockup function.
 * - LogoMockupOutput - The return type for the generateLogoMockup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogoMockupInputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      "A logo image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  mockupType: z.string().describe('The type of mockup to generate (e.g., "T-shirt", "Business Card").'),
});
export type LogoMockupInput = z.infer<typeof LogoMockupInputSchema>;

const LogoMockupOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated mockup image, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type LogoMockupOutput = z.infer<typeof LogoMockupOutputSchema>;

export async function generateLogoMockup(input: LogoMockupInput): Promise<LogoMockupOutput> {
  return logoMockupGeneratorFlow(input);
}

const logoMockupGeneratorFlow = ai.defineFlow(
  {
    name: 'logoMockupGeneratorFlow',
    inputSchema: LogoMockupInputSchema,
    outputSchema: LogoMockupOutputSchema,
  },
  async ({ logoDataUri, mockupType }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: logoDataUri } },
        { text: `Generate a photorealistic mockup of a "${mockupType}" that prominently and professionally features the provided logo.` },
      ],
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
