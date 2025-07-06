'use server';
/**
 * @fileOverview An AI-powered social media kit generator.
 *
 * - generateSocialMediaKit - A function that handles the social media kit generation process.
 * - SocialMediaKitInput - The input type for the generateSocialMediaKit function.
 * - SocialMediaKitOutput - The return type for the generateSocialMediaKit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SocialMediaKitInputSchema = z.object({
  logoDataUri: z
    .string()
    .describe(
      "A logo image, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  primaryColor: z.string().describe('The primary brand color, preferably as a hex code.'),
  platform: z.string().describe('The social media platform (e.g., "Twitter", "LinkedIn").'),
});
export type SocialMediaKitInput = z.infer<typeof SocialMediaKitInputSchema>;

const SocialMediaKitOutputSchema = z.object({
  profilePictureUri: z.string().describe('The generated profile picture image, as a data URI.'),
  bannerUri: z.string().describe('The generated banner image, as a data URI.'),
});
export type SocialMediaKitOutput = z.infer<typeof SocialMediaKitOutputSchema>;

export async function generateSocialMediaKit(input: SocialMediaKitInput): Promise<SocialMediaKitOutput> {
  return socialMediaKitGeneratorFlow(input);
}

const socialMediaKitGeneratorFlow = ai.defineFlow(
  {
    name: 'socialMediaKitGeneratorFlow',
    inputSchema: SocialMediaKitInputSchema,
    outputSchema: SocialMediaKitOutputSchema,
  },
  async ({ logoDataUri, primaryColor, platform }) => {
    // Generate profile picture and banner in parallel
    const [profilePicResult, bannerResult] = await Promise.all([
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: logoDataUri } },
          { text: `Generate a square profile picture for a "${platform}" page. It should feature the provided logo prominently. The background must be a solid, plain color using this hex code: ${primaryColor}.` },
        ],
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: logoDataUri } },
          { text: `Generate a wide banner image for a "${platform}" page. It should be an abstract, visually appealing graphic that uses "${primaryColor}" as the dominant color. The provided logo should be incorporated subtly and tastefully into the design, not just centered.` },
        ],
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    ]);
    
    if (!profilePicResult.media?.url || !bannerResult.media?.url) {
        throw new Error('Image generation failed for one or more assets.');
    }

    return {
      profilePictureUri: profilePicResult.media.url,
      bannerUri: bannerResult.media.url,
    };
  }
);
