
'use server';

/**
 * @fileOverview A flow for saving a contact message to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export async function saveContactMessage(input: SaveContactMessageInput): Promise<SaveContactMessageOutput> {
    try {
        const docRef = await addDoc(collection(db, "messages"), {
            ...input,
            createdAt: serverTimestamp()
        });
        return { success: true, messageId: docRef.id };
    } catch (error: any) {
        console.error("Error saving message to Firestore:", error);
        return { success: false, error: error.message };
    }
}
