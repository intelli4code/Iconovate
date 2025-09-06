
import { z } from 'zod';

export const SaveContactMessageInputSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  service: z.string().min(1, "Please select a service."),
  description: z.string().min(20, "Please provide a detailed description (at least 20 characters)."),
  duration: z.string().min(3, "Please provide an expected duration."),
  budget: z.string().min(2, "Please provide a budget range."),
  sourceFiles: z.string().min(3, "Please specify required source files."),
  revisions: z.coerce.number().min(0, "Revisions must be a non-negative number."),
});
export type SaveContactMessageInput = z.infer<typeof SaveContactMessageInputSchema>;

export const SaveContactMessageOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type SaveContactMessageOutput = z.infer<typeof SaveContactMessageOutputSchema>;
