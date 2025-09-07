
'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import type { ContactMessage, SiteIdentity } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z.object({
  proposal: z.any(),
  siteIdentity: z.any().optional(),
});

export async function sendProposalReceivedEmail(proposal: ContactMessage): Promise<{ success: boolean, message?: string, error?: string }> {
  if (!proposal.email) {
    return { success: false, error: 'Client email is not provided for this proposal.' };
  }

  try {
    const contentDocRef = doc(db, "siteContent", "main");
    const contentDoc = await getDoc(contentDocRef);
    const siteIdentity = contentDoc.exists() ? contentDoc.data().identity as SiteIdentity : null;

    const validation = emailSchema.safeParse({ proposal, siteIdentity });

    if (!validation.success) {
      console.error('Invalid proposal data for email:', validation.error);
      return { success: false, error: 'Invalid proposal data provided.' };
    }

    const { data } = validation;
    const portalLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/client-login`;
    const companyName = data.siteIdentity?.siteName || 'BrandBoost AI';
    const logoUrl = data.siteIdentity?.logoUrl || '';

    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [data.proposal.email],
      subject: `We've Received Your Proposal! (ID: ${data.proposal.proposalId})`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Proposal Received</title>
            <style>
                body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                .header { background-color: #2c244b; padding: 40px 20px; text-align: center; }
                .header img { max-width: 150px; margin-bottom: 20px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
                .content { padding: 40px; color: #333333; line-height: 1.6; }
                .content h2 { color: #663399; margin-top: 0; }
                .proposal-details { background-color: #f9f9f9; border-left: 4px solid #663399; padding: 20px; margin: 20px 0; }
                .proposal-details p { margin: 5px 0; }
                .proposal-details strong { color: #2c244b; }
                .button-container { text-align: center; margin-top: 30px; }
                .button { display: inline-block; padding: 15px 30px; background-color: #eb5d9c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #999999; }
                .footer a { color: #663399; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo">` : ''}
                    <h1>Thank you for your submission!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${data.proposal.name},</h2>
                    <p>This email confirms that we have received your proposal, <strong>#${data.proposal.proposalId}</strong>. Our team will review your request and get back to you with an update shortly.</p>
                    <p>You will receive another email with your dedicated project portal link once the project is approved.</p>
                    <div class="proposal-details">
                        <p><strong>Service of Interest:</strong> ${data.proposal.service}</p>
                        <p><strong>Proposal ID:</strong> ${data.proposal.proposalId}</p>
                        <p><strong>Submission Date:</strong> ${format(new Date(data.proposal.createdAt), 'PP')}</p>
                    </div>
                    <p>If you have any questions, please do not hesitate to contact our support team by replying to this email.</p>
                    <p>Thank you,</p>
                    <p>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>This email was sent to ${data.proposal.email}.</p>
                    <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
        throw new Error(emailResponse.error.message);
    }

    return { success: true, message: `Proposal confirmation sent to ${proposal.email}` };
  } catch (error: any) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message || 'Failed to send email.' };
  }
}
