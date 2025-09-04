
'use server';

/**
 * @fileOverview A flow for saving a contact message to Firestore.
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SaveContactMessageInput, SaveContactMessageOutput } from '@/types/contact-form';

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
