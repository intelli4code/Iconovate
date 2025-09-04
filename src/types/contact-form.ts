
import { z } from 'zod';

export const SaveContactMessageInputSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  subject: z.string().min(3, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
  selectedPackage: z.string().optional(),
});
export type SaveContactMessageInput = z.infer<typeof SaveContactMessageInputSchema>;

export const SaveContactMessageOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type SaveContactMessageOutput = z.infer<typeof SaveContactMessageOutputSchema>;
