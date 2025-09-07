
'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import type { Project, SiteIdentity } from '@/types';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z.object({
  project: z.any(),
  siteIdentity: z.any().optional(),
});

export async function sendCancellationEmail(project: Project): Promise<{ success: boolean, message?: string, error?: string }> {
  if (!project.clientEmail) {
    return { success: false, error: 'Client email is not provided for this project.' };
  }

  try {
    const contentDocRef = doc(db, "siteContent", "main");
    const contentDoc = await getDoc(contentDocRef);
    const siteIdentity = contentDoc.exists() ? contentDoc.data().identity as SiteIdentity : null;

    const validation = emailSchema.safeParse({ project, siteIdentity });

    if (!validation.success) {
      console.error('Invalid project data for cancellation email:', validation.error);
      return { success: false, error: 'Invalid project data provided.' };
    }

    const { data } = validation;
    const portalLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portal/${project.id}`;
    const companyName = data.siteIdentity?.siteName || 'BrandBoost AI';

    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [data.project.clientEmail],
      subject: `Confirmation of Cancellation for Order #${data.project.id}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Order Has Been Cancelled</title>
            <style>
                body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                .header { background-color: #2c244b; padding: 40px 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
                .content { padding: 40px; color: #333333; line-height: 1.6; }
                .content h2 { color: #663399; margin-top: 0; }
                .order-details { background-color: #f9f9f9; border-left: 4px solid #663399; padding: 20px; margin: 20px 0; }
                .order-details p { margin: 5px 0; }
                .order-details strong { color: #2c244b; }
                .button-container { text-align: center; margin-top: 30px; }
                .button { display: inline-block; padding: 15px 30px; background-color: #eb5d9c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #999999; }
                .footer a { color: #663399; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Cancelled</h1>
                </div>
                <div class="content">
                    <h2>Hello ${data.project.client},</h2>
                    <p>We are writing to confirm that your order <strong>#${data.project.id}</strong> has been successfully cancelled. We apologize for any inconvenience this may cause.</p>
                    <p>If this was an error or you wish to place a new order, please visit your client portal. The project details associated with the cancelled order are listed below for your reference.</p>
                    <div class="order-details">
                        <p><strong>Project Name:</strong> ${data.project.name}</p>
                        <p><strong>Order ID:</strong> ${data.project.id}</p>
                        <p><strong>Date of Cancellation:</strong> ${format(new Date(), 'PP')}</p>
                        <p><strong>Cancellation Reason:</strong> ${data.project.cancellationReason || 'No reason provided.'}</p>
                    </div>
                    <p>If you have any questions, please do not hesitate to contact our support team.</p>
                    <div class="button-container">
                        <a href="${portalLink}" class="button">Go to Client Portal</a>
                    </div>
                    <p>Thank you,</p>
                    <p>The ${companyName} Team</p>
                </div>
                <div class="footer">
                    <p>This email was sent to ${data.project.clientEmail}.</p>
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

    return { success: true, message: `Cancellation email sent to ${project.clientEmail}` };
  } catch (error: any) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message || 'Failed to send email.' };
  }
}
