
'use server';

/**
 * @fileOverview An AI-powered project proposal generator.
 *
 * - generateProposal - A function that generates a project proposal from strategic inputs.
 * - ProposalGeneratorInput - The input type for the function.
 * - ProposalGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProposalGeneratorInputSchema = z.object({
  clientName: z.string().describe("The client's name."),
  archetypeAnalysis: z.string().describe("The full text of the AI-generated brand archetype analysis."),
  visualDirection: z.string().describe("The full text of the AI-generated visual direction synthesis."),
});
export type ProposalGeneratorInput = z.infer<typeof ProposalGeneratorInputSchema>;

const ProposalGeneratorOutputSchema = z.object({
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

export async function generateProposal(input: ProposalGeneratorInput): Promise<ProposalGeneratorOutput> {
  return proposalGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proposalGeneratorPrompt',
  input: { schema: ProposalGeneratorInputSchema },
  output: { schema: ProposalGeneratorOutputSchema },
  prompt: `You are an expert design agency consultant. Create a comprehensive and persuasive project proposal for a new branding and design project for "{{clientName}}".

Use the following strategic inputs to inform the proposal:

**Brand Archetype Analysis:**
{{{archetypeAnalysis}}}

**Visual Direction Synthesis:**
{{{visualDirection}}}

Based on this, generate the following sections for the proposal:
1.  **Proposal Title:** A creative and professional title.
2.  **Executive Summary:** A high-level overview of the project's strategic goals and the value your agency will provide.
3.  **Strategic Approach:** Detail the recommended approach, connecting it directly to the insights from the archetype and visual analysis. Explain *why* this is the right direction for the client.
4.  **Scope of Work:** Recommend a list of specific services (e.g., Logo & Brand Identity, Web & UI/UX Design) that will be required to execute this vision. Provide a brief description for each service.
5.  **Timeline:** Provide a high-level estimated timeline for the project (e.g., 4-6 weeks).`,
});

const proposalGeneratorFlow = ai.defineFlow(
  {
    name: 'proposalGeneratorFlow',
    inputSchema: ProposalGeneratorInputSchema,
    outputSchema: ProposalGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
