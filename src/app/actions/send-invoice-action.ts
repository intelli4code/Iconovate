
'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import type { Invoice, Project, SiteIdentity } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const emailSchema = z.object({
  clientEmail: z.string().email(),
  invoice: z.any(),
  siteIdentity: z.any().optional(),
});

export async function sendInvoiceByEmail(invoice: Invoice): Promise<{ success: boolean, message?: string, error?: string }> {
  if (!invoice.projectId) {
    return { success: false, error: 'Project ID is missing from the invoice.' };
  }

  try {
    const projectRef = doc(db, 'projects', invoice.projectId);
    const contentDocRef = doc(db, "siteContent", "main");
    
    const [projectDoc, contentDoc] = await Promise.all([
      getDoc(projectRef),
      getDoc(contentDocRef),
    ]);

    if (!projectDoc.exists() || !projectDoc.data().clientEmail) {
      console.error(`Could not find project or client email for invoice ${invoice.id}`);
      return { success: false, error: 'Client email not found for this project. Please ask client to provide it in their portal.' };
    }
    
    const project = projectDoc.data() as Project;
    const siteIdentity = contentDoc.exists() ? contentDoc.data().identity as SiteIdentity : null;

    const clientEmail = project.clientEmail;
    if (!clientEmail) {
        return { success: false, error: 'Client email is not available.' };
    }

    const validation = emailSchema.safeParse({ clientEmail, invoice, siteIdentity });

    if (!validation.success) {
      console.error('Invalid invoice data for email:', validation.error);
      return { success: false, error: 'Invalid invoice data provided.' };
    }

    const { data } = validation;
    const portalLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portal/${project.id}`;
    const companyName = data.siteIdentity?.siteName || 'BrandBoost AI';

    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [data.clientEmail],
      subject: `Invoice #${data.invoice.invoiceNumber} from ${companyName}`,
      html: `
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h1 style="color: #6366f1; text-align: center;">New Invoice</h1>
            <p>Hi ${data.invoice.clientName},</p>
            <p>A new invoice has been generated for your project, <strong>${data.invoice.projectName}</strong>. Please review the details below.</p>
            <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; margin: 20px 0; padding: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 10px;"><strong>Invoice Number:</strong></td>
                  <td style="text-align: right;">${data.invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;"><strong>Date Issued:</strong></td>
                  <td style="text-align: right;">${data.invoice.issueDate}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;"><strong>Due Date:</strong></td>
                  <td style="text-align: right;">${data.invoice.dueDate}</td>
                </tr>
                <tr style="font-size: 24px; font-weight: bold;">
                  <td style="padding-top: 20px; border-top: 1px solid #ccc;">Amount Due:</td>
                  <td style="padding-top: 20px; text-align: right; border-top: 1px solid #ccc;">${formatCurrency(data.invoice.total)}</td>
                </tr>
              </table>
            </div>
            ${data.invoice.paymentLink ? `<div style="text-align: center; margin: 30px 0;"><a href="${data.invoice.paymentLink}" style="background-color: #6366f1; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay Now Securely</a></div>` : ''}
            <p style="text-align: center;">You can also view and manage this invoice, and your project, through your client portal:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${portalLink}" style="background-color: #e5e7eb; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project Portal</a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #999;">If you have any questions, please reply to this email.</p>
          </div>
        </body>
      `,
    });

    if (emailResponse.error) {
        throw new Error(emailResponse.error.message);
    }

    return { success: true, message: `Invoice sent to ${data.clientEmail}` };
  } catch (error: any) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message || 'Failed to send email.' };
  }
}
