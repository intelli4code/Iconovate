'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import type { Invoice, Project } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const reminderSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string().email(),
  invoiceNumber: z.string(),
  dueDate: z.string(),
  total: z.number(),
});

export async function sendInvoiceReminder(invoice: Invoice): Promise<{ success: boolean, message?: string, error?: string }> {
  // Fetch the project to get the client's email address
  if (!invoice.projectId) {
    return { success: false, error: 'Project ID is missing from the invoice.' };
  }

  try {
    const projectRef = doc(db, 'projects', invoice.projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists() || !projectDoc.data().clientEmail) {
      console.error(`Could not find project or client email for invoice ${invoice.id}`);
      return { success: false, error: 'Client email not found for this project.' };
    }
    
    const project = projectDoc.data() as Project;
    const clientEmail = project.clientEmail;

    if (!clientEmail) {
        return { success: false, error: 'Client email is not available.' };
    }

    const validation = reminderSchema.safeParse({
      clientName: invoice.clientName,
      clientEmail: clientEmail,
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate,
      total: invoice.total,
    });

    if (!validation.success) {
      console.error('Invalid invoice data for reminder:', validation.error);
      return { success: false, error: 'Invalid invoice data provided.' };
    }

    const { data } = validation;

    const emailResponse = await resend.emails.send({
      from: 'BrandBoost AI <onboarding@resend.dev>', // IMPORTANT: Replace with your domain on Resend
      to: [data.clientEmail],
      subject: `Reminder: Payment for Invoice #${data.invoiceNumber}`,
      html: `
        <h1>Payment Reminder</h1>
        <p>Hi ${data.clientName},</p>
        <p>This is a friendly reminder that invoice <strong>#${data.invoiceNumber}</strong> for the amount of <strong>${formatCurrency(data.total)}</strong> was due on <strong>${data.dueDate}</strong>.</p>
        <p>You can view and manage your project and invoices by logging into your client portal.</p>
        <p>Thank you,</p>
        <p>The BrandBoost AI Team</p>
      `,
    });

    if (emailResponse.error) {
        throw new Error(emailResponse.error.message);
    }

    return { success: true, message: `Reminder sent to ${data.clientEmail}` };
  } catch (error: any) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message || 'Failed to send email.' };
  }
}
