'use server';

/**
 * @fileOverview An AI-powered social media post generator.
 *
 * - generateSocialMediaPosts - A function that handles post generation.
 * - SocialMediaPostsInput - The input type for the function.
 * - SocialMediaPostsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SocialMediaPostsInputSchema = z.object({
  brandDescription: z.string().describe('A description of the brand, its products, and target audience.'),
  brandVoice: z.string().describe('The desired tone of voice for the posts (e.g., witty, professional, inspiring).'),
  platform: z.string().describe('The target social media platform (e.g., Twitter, Instagram, LinkedIn).'),
  numberOfPosts: z.coerce.number().min(1).max(7).describe('The number of posts to generate (1-7).'),
});
export type SocialMediaPostsInput = z.infer<typeof SocialMediaPostsInputSchema>;

const SocialMediaPostsOutputSchema = z.object({
  posts: z.array(
    z.object({
      postText: z.string().describe('The full text content for the social media post, including hashtags.'),
      imagePrompt: z.string().describe('A detailed prompt for an image generation AI to create a relevant visual for this post.'),
    })
  ).describe('An array of generated social media posts.'),
});
export type SocialMediaPostsOutput = z.infer<typeof SocialMediaPostsOutputSchema>;

export async function generateSocialMediaPosts(input: SocialMediaPostsInput): Promise<SocialMediaPostsOutput> {
  return socialMediaPostGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'socialMediaPostPrompt',
  input: { schema: SocialMediaPostsInputSchema },
  output: { schema: SocialMediaPostsOutputSchema },
  prompt: `You are an expert social media manager. Based on the following brand information, generate {{{numberOfPosts}}} social media posts for the specified platform.

**Brand Description:** {{{brandDescription}}}
**Brand Voice:** {{{brandVoice}}}
**Platform:** {{{platform}}}

For each post, create compelling text content that is appropriate for the platform and aligns with the brand voice. Also, create a detailed, creative prompt for an image generation AI that would produce a visually stunning and relevant image to accompany the post text.
`,
});

const socialMediaPostGeneratorFlow = ai.defineFlow(
  {
    name: 'socialMediaPostGeneratorFlow',
    inputSchema: SocialMediaPostsInputSchema,
    outputSchema: SocialMediaPostsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
