
'use server';

/**
 * @fileOverview An AI-powered project task generator from a client brief.
 *
 * - generateTasksFromBrief - A function that creates a task list from a description.
 * - TaskGeneratorInput - The input type for the function.
 * - TaskGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskGeneratorInputSchema = z.object({
  briefDescription: z.string().describe("A detailed description of the project brief, including goals and deliverables."),
});
export type TaskGeneratorInput = z.infer<typeof TaskGeneratorInputSchema>;

const TaskGeneratorOutputSchema = z.object({
  tasks: z.array(
    z.object({
        text: z.string().describe("A single, actionable task for a design project."),
    })
  ).describe("A list of actionable tasks based on the project brief."),
});
export type TaskGeneratorOutput = z.infer<typeof TaskGeneratorOutputSchema>;

export async function generateTasksFromBrief(input: TaskGeneratorInput): Promise<TaskGeneratorOutput> {
  return taskGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taskGeneratorPrompt',
  input: { schema: TaskGeneratorInputSchema },
  output: { schema: TaskGeneratorOutputSchema },
  prompt: `You are an expert project manager for a design agency. Based on the following client brief, generate a list of actionable, bite-sized tasks required to complete the project. The tasks should cover the entire project lifecycle from research to final delivery.

Project Brief:
{{{briefDescription}}}

Generate a comprehensive list of tasks.`,
});

const taskGeneratorFlow = ai.defineFlow(
  {
    name: 'taskGeneratorFlow',
    inputSchema: TaskGeneratorInputSchema,
    outputSchema: TaskGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
