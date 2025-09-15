'use server';

import { ai } from '@/ai/genkit';
import { analyzeArchetype, type ArchetypeAnalysisInput, type ArchetypeAnalysisOutput } from '@/ai/flows/archetype-analyzer';
import { synthesizeVisuals, type VisualSynthesisInput, type VisualSynthesisOutput } from '@/ai/flows/visual-synthesis';
import { generateProposal, type ProposalGeneratorInput, type ProposalGeneratorOutput } from '@/ai/flows/proposal-generator';

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

export type { ArchetypeAnalysisOutput, VisualSynthesisOutput, ProposalGeneratorOutput };
