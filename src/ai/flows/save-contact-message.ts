

'use server';

/**
 * @fileOverview A flow for saving a contact message to Firestore and sending a confirmation email.
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SaveContactMessageInput, SaveContactMessageOutput } from '@/types/contact-form';
import { sendProposalReceivedEmail } from '@/app/actions/send-proposal-received-email';
import { v4 as uuidv4 } from 'uuid';

export async function saveContactMessage(input: SaveContactMessageInput): Promise<SaveContactMessageOutput> {
    try {
        const proposalId = `BB-${uuidv4().slice(0, 8).toUpperCase()}`;

        const docRef = await addDoc(collection(db, "messages"), {
            ...input,
            proposalId,
            status: 'New',
            createdAt: serverTimestamp()
        });

        // Send confirmation email after successfully saving
        await sendProposalReceivedEmail({
            id: docRef.id,
            proposalId,
            ...input,
            createdAt: new Date(), // Use current date for the email
        });

        return { success: true, messageId: docRef.id };
    } catch (error: any) {
        console.error("Error saving message or sending email:", error);
        return { success: false, error: error.message };
    }
}
