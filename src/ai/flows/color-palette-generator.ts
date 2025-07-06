'use server';

/**
 * @fileOverview An AI-powered color palette generator.
 *
 * - generateColorPalette - A function that handles the color palette generation process.
 * - ColorPaletteInput - The input type for the generateColorPalette function.
 * - ColorPaletteOutput - The return type for the generateColorPalette function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ColorPaletteInputSchema = z.object({
  brandVibe: z.string().describe("A description of the brand's vibe, feeling, or industry (e.g., 'tech startup, innovative, trustworthy')."),
});
export type ColorPaletteInput = z.infer<typeof ColorPaletteInputSchema>;

const ColorPaletteOutputSchema = z.object({
  paletteName: z.string().describe("A creative name for the generated color palette."),
  palette: z
    .array(
      z.object({
        name: z.string().describe("A descriptive name for the color (e.g., 'Midnight Blue', 'Mint Green')."),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color code.").describe("The hex code for the color."),
        role: z.string().describe("The intended role for this color (e.g., 'Primary', 'Secondary', 'Accent 1', 'Neutral Background', 'Text Color')."),
      })
    )
    .length(5)
    .describe('An array of exactly 5 colors.'),
});
export type ColorPaletteOutput = z.infer<typeof ColorPaletteOutputSchema>;

export async function generateColorPalette(input: ColorPaletteInput): Promise<ColorPaletteOutput> {
  return colorPaletteGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'colorPalettePrompt',
  input: { schema: ColorPaletteInputSchema },
  output: { schema: ColorPaletteOutputSchema },
  prompt: `You are an expert brand designer and color theorist. Based on the following brand description, generate a harmonious and professional 5-color palette.

Brand Vibe: {{{brandVibe}}}

Provide a creative name for the palette. For each of the 5 colors, provide a descriptive name, its hex code, and its role in the brand system (Primary, Secondary, Accent 1, Neutral Background, Text Color). The palette should be modern, accessible, and visually appealing.`,
});

const colorPaletteGeneratorFlow = ai.defineFlow(
  {
    name: 'colorPaletteGeneratorFlow',
    inputSchema: ColorPaletteInputSchema,
    outputSchema: ColorPaletteOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
