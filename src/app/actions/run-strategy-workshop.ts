
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Archetype Analyzer Logic ---
const ArchetypeAnalysisInputSchema = z.object({
  answers: z.array(z.string()).length(5).describe('An array of 5 answers to the brand archetype questionnaire.'),
});
type ArchetypeAnalysisInput = z.infer<typeof ArchetypeAnalysisInputSchema>;

export const ArchetypeAnalysisOutputSchema = z.object({
  primaryArchetype: z.string().describe("The primary brand archetype (e.g., The Hero, The Sage)."),
  secondaryArchetype: z.string().describe("The secondary brand archetype."),
  analysis: z.string().describe("A detailed analysis of why these archetypes were chosen based on the answers."),
  toneAndStyle: z.string().describe("Guidance on the brand's tone of voice and visual style based on the archetypes."),
});
export type ArchetypeAnalysisOutput = z.infer<typeof ArchetypeAnalysisOutputSchema>;

const analyzeArchetype = ai.defineFlow(
  {
    name: 'archetypeAnalyzerFlow',
    inputSchema: ArchetypeAnalysisInputSchema,
    outputSchema: ArchetypeAnalysisOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert brand strategist specializing in brand archetypes. Based on the 12 classic brand archetypes (The Innocent, Everyman, Hero, Outlaw, Explorer, Creator, Ruler, Magician, Lover, Caregiver, Jester, Sage), analyze the following answers to a brand questionnaire.

Determine the primary and secondary archetypes for the brand. Provide a detailed analysis explaining your choices and offer guidance on the appropriate tone of voice and visual style that aligns with these archetypes.

Questionnaire Answers:
1. How does your brand solve a problem for customers? - ${input.answers[0]}
2. What is your brand's personality? - ${input.answers[1]}
3. What is your company culture like? - ${input.answers[2]}
4. Who are your biggest competitors and how are you different? - ${input.answers[3]}
5. What do you want customers to feel when they interact with your brand? - ${input.answers[4]}

Please provide a full analysis.`;
    
    const { output } = await ai.generate({ prompt, output: { schema: ArchetypeAnalysisOutputSchema } });
    return output!;
  }
);

// --- Visual Synthesizer Logic ---
const VisualSynthesisInputSchema = z.object({
  images: z.array(z.object({
      url: z.string().describe("An image as a data URI."),
      prompt: z.string().describe("The prompt used to generate the image.")
  })).min(3, "At least 3 images are required.").describe("An array of images the user has selected."),
});
type VisualSynthesisInput = z.infer<typeof VisualSynthesisInputSchema>;

export const VisualSynthesisOutputSchema = z.object({
  visualDirection: z.string().describe('A detailed summary of the synthesized visual direction, including themes, color palettes, textures, and overall mood.'),
  styleKeywords: z.array(z.string()).describe('A list of keywords that describe the visual style (e.g., "Minimalist", "Organic", "Vibrant").'),
});
export type VisualSynthesisOutput = z.infer<typeof VisualSynthesisOutputSchema>;

const synthesizeVisuals = ai.defineFlow(
  {
    name: 'visualSynthesizerFlow',
    inputSchema: VisualSynthesisInputSchema,
    outputSchema: VisualSynthesisOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        prompt: `You are an expert creative director. A client has selected a few images that they feel represent their brand.
Analyze the following images and their original prompts to synthesize a coherent and compelling visual direction.

Identify common themes, color palettes, textures, moods, and overall aesthetics.
Based on your analysis, provide a detailed summary of the recommended "Visual Direction" and a list of keywords that encapsulate this style.

Selected Images:
${input.images.map(img => `---
Image Prompt: ${img.prompt}
Image: {{media url=${img.url}}}
---`).join('\n')}
`,
        output: { schema: VisualSynthesisOutputSchema }
    });
    return output!;
  }
);


// --- Proposal Generator Logic ---
const ProposalGeneratorInputSchema = z.object({
  clientName: z.string().describe("The client's name."),
  archetypeAnalysis: z.string().describe("The full text of the AI-generated brand archetype analysis."),
  visualDirection: z.string().describe("The full text of the AI-generated visual direction synthesis."),
});
export type ProposalGeneratorInput = z.infer<typeof ProposalGeneratorInputSchema>;

export const ProposalGeneratorOutputSchema = z.object({
  proposalTitle: z.string().describe("A compelling title for the project proposal."),
  executiveSummary: z.string().describe("A concise summary of the project goals and proposed solution."),
  strategicApproach: z.string().describe("An explanation of the proposed strategy, referencing the archetype and visual direction."),
  scopeOfWork: z.array(z.object({
    service: z.string().describe("A recommended service (e.g., 'Brand Identity Design', 'Web Design')."),
    description: z.string().describe("A short description of what this service entails for the project."),
  })).describe("A list of recommended services with descriptions."),
  timeline: z.string().describe("An estimated project timeline."),
});
export type ProposalGeneratorOutput = z.infer<typeof ProposalGeneratorOutputSchema>;

const generateProposal = ai.defineFlow({
    name: 'proposalGeneratorFlow',
    inputSchema: ProposalGeneratorInputSchema,
    outputSchema: ProposalGeneratorOutputSchema
}, async(input) => {
    const { output } = await ai.generate({
        prompt: `You are an expert design agency consultant. Create a comprehensive and persuasive project proposal for a new branding and design project for "${input.clientName}".

Use the following strategic inputs to inform the proposal:

**Brand Archetype Analysis:**
${input.archetypeAnalysis}

**Visual Direction Synthesis:**
${input.visualDirection}

Based on this, generate the following sections for the proposal:
1.  **Proposal Title:** A creative and professional title.
2.  **Executive Summary:** A high-level overview of the project's strategic goals and the value your agency will provide.
3.  **Strategic Approach:** Detail the recommended approach, connecting it directly to the insights from the archetype and visual analysis. Explain *why* this is the right direction for the client.
4.  **Scope of Work:** Recommend a list of specific services (e.g., Logo & Brand Identity, Web & UI/UX Design) that will be required to execute this vision. Provide a brief description for each service.
5.  **Timeline:** Provide a high-level estimated timeline for the project (e.g., 4-6 weeks).`,
        output: { schema: ProposalGeneratorOutputSchema },
    });
    return output!;
});


// --- Main Server Action ---

export interface WorkshopImage {
    url: string;
    prompt: string;
}

interface RunStrategyWorkshopInput {
  step: 'archetype' | 'proposal';
  archetypeInput?: ArchetypeAnalysisInput;
  visualInput?: VisualSynthesisInput;
  archetypeAnalysis?: string;
  clientName?: string;
}

interface RunStrategyWorkshopOutput {
  archetypeResult?: ArchetypeAnalysisOutput;
  imageOptions?: WorkshopImage[];
  visualResult?: VisualSynthesisOutput;
  proposalResult?: ProposalGeneratorOutput;
  error?: string;
}

export async function runStrategyWorkshop(
  input: RunStrategyWorkshopInput
): Promise<RunStrategyWorkshopOutput> {
  try {
    if (input.step === 'archetype' && input.archetypeInput) {
      const archetypeResult = await analyzeArchetype(input.archetypeInput);
      
      const prompts = [
            `An abstract image representing the feeling of the ${archetypeResult.primaryArchetype} archetype.`,
            `A lifestyle photo that embodies the values of a ${archetypeResult.primaryArchetype} brand.`,
            `A texture or pattern suitable for a ${archetypeResult.primaryArchetype} brand.`,
            `An architectural style that aligns with a ${archetypeResult.primaryArchetype} brand.`,
            `A product shot reflecting the quality of a ${archetypeResult.primaryArchetype} brand.`,
            `A nature scene that captures the essence of the ${archetypeResult.primaryArchetype} archetype.`
      ];

      const imagePromises = prompts.map(prompt =>
          ai.generate({ model: 'googleai/gemini-2.0-flash-preview-image-generation', prompt, config: { responseModalities: ['IMAGE'] } })
      );
      const imageResults = await Promise.all(imagePromises);
      const imageOptions = imageResults.map((result, index) => ({ url: result.media!.url, prompt: prompts[index] }));

      return { archetypeResult, imageOptions };
    }

    if (input.step === 'proposal' && input.visualInput && input.archetypeAnalysis && input.clientName) {
      const visualResult = await synthesizeVisuals(input.visualInput);
      
      const proposalResult = await generateProposal({
        clientName: input.clientName,
        archetypeAnalysis: input.archetypeAnalysis,
        visualDirection: visualResult.visualDirection,
      });

      return { visualResult, proposalResult };
    }
    
    return { error: 'Invalid step or missing inputs.' };
  } catch (error: any) {
    console.error("Strategy workshop error:", error);
    return { error: error.message || 'An unknown error occurred during the workshop.' };
  }
}

    