'use server';

/**
 * @fileOverview AI-powered tool for generating personalized presentation text for graphic designers.
 *
 * - generatePresentationText - A function that generates presentation text based on project details.
 * - PresentationTextInput - The input type for the generatePresentationText function.
 * - PresentationTextOutput - The return type for the generatePresentationText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PresentationTextInputSchema = z.object({
  logoDescription: z.string().describe('Description of the logo design.'),
  brandDescription: z.string().describe('Description of the brand identity.'),
  projectDetails: z.string().describe('Details about the project, goals, and target audience.'),
  keywords: z.string().optional().describe('Optional keywords to include in the presentation text.'),
});
export type PresentationTextInput = z.infer<typeof PresentationTextInputSchema>;

const PresentationTextOutputSchema = z.object({
  presentationText: z.string().describe('The generated presentation text.'),
});
export type PresentationTextOutput = z.infer<typeof PresentationTextOutputSchema>;

export async function generatePresentationText(input: PresentationTextInput): Promise<PresentationTextOutput> {
  return presentationTextFlow(input);
}

const presentationTextPrompt = ai.definePrompt({
  name: 'presentationTextPrompt',
  input: {schema: PresentationTextInputSchema},
  output: {schema: PresentationTextOutputSchema},
  prompt: `You are an expert presentation writer for graphic designers.

  Based on the following information, generate compelling and personalized presentation text for a logo, brand, or project.

  Logo Description: {{{logoDescription}}}
  Brand Description: {{{brandDescription}}}
  Project Details: {{{projectDetails}}}

  {{#if keywords}}
  Include the following keywords: {{{keywords}}}
  {{/if}}

  The presentation text should be high-quality, engaging, and tailored to impress clients.
  `,
});

const presentationTextFlow = ai.defineFlow(
  {
    name: 'presentationTextFlow',
    inputSchema: PresentationTextInputSchema,
    outputSchema: PresentationTextOutputSchema,
  },
  async input => {
    const {output} = await presentationTextPrompt(input);
    return output!;
  }
);
