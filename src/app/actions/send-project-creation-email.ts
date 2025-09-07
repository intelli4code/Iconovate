
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

export async function sendProjectCreationEmail(project: Project): Promise<{ success: boolean, message?: string, error?: string }> {
  if (!project.clientEmail) {
    return { success: false, error: 'Client email is not provided for this project.' };
  }

  try {
    const contentDocRef = doc(db, "siteContent", "main");
    const contentDoc = await getDoc(contentDocRef);
    const siteIdentity = contentDoc.exists() ? contentDoc.data().identity as SiteIdentity : null;

    const validation = emailSchema.safeParse({ project, siteIdentity });

    if (!validation.success) {
      console.error('Invalid project data for email:', validation.error);
      return { success: false, error: 'Invalid project data provided.' };
    }

    const { data } = validation;
    const portalLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portal/${project.id}`;
    const companyName = data.siteIdentity?.siteName || 'BrandBoost AI';
    const logoUrl = data.siteIdentity?.logoUrl || '';

    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [data.project.clientEmail],
      subject: `Your Project "${data.project.name}" has been created!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank you for your order!</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f7f7f7;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }
                .header {
                    background-color: #2c244b;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header img {
                    max-width: 150px;
                    height: auto;
                }
                .content {
                    padding: 30px;
                    color: #333333;
                    line-height: 1.6;
                }
                .content h1 {
                    color: #663399;
                    font-size: 28px;
                    font-weight: 700;
                    margin-top: 0;
                    margin-bottom: 20px;
                }
                .content p {
                    font-size: 16px;
                    margin-bottom: 15px;
                }
                .project-details {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 20px;
                    border: 1px solid #eeeeee;
                }
                .project-details h2 {
                    color: #2c244b;
                    font-size: 20px;
                    margin-top: 0;
                    margin-bottom: 15px;
                }
                .project-details p {
                    margin-bottom: 10px;
                }
                .project-details strong {
                    color: #2c244b;
                }
                .button-container {
                    text-align: center;
                    margin-top: 30px;
                    margin-bottom: 20px;
                }
                .button {
                    background-color: #eb5d9c;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    display: inline-block;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: #d1498b;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #999999;
                    border-top: 1px solid #eeeeee;
                }
                .footer a {
                    color: #663399;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <div class="container">
                            <div class="header">
                                ${logoUrl ? `<img src="${logoUrl}" alt="${companyName} Logo">` : `<h1>${companyName}</h1>`}
                            </div>

                            <div class="content">
                                <h1>Thank you for your order, ${data.project.client}!</h1>
                                <p>We're thrilled to confirm your new project. We've received your details and our team is already getting started on bringing your vision to life.</p>
                                
                                <div class="project-details">
                                    <h2>Project Details</h2>
                                    <p><strong>Order ID:</strong> <span id="order-id">${data.project.id}</span></p>
                                    <p><strong>Service:</strong> ${data.project.projectType}</p>
                                    <p><strong>Project Description:</strong> ${data.project.description || 'As discussed.'}</p>
                                    <p><strong>Expected Delivery:</strong> ${format(new Date(data.project.dueDate), 'PP')}</p>
                                </div>
                                
                                <p>You can track the progress of your project and communicate with our team by logging into your client portal.</p>

                                <div class="button-container">
                                    <a href="${portalLink}" class="button">Log In to Your Portal</a>
                                </div>
                                
                                <p>If you have any questions, please don't hesitate to reply to this email. We look forward to working with you!</p>
                                <p>Best regards,<br>The Team at ${companyName}</p>
                            </div>

                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                                <p><a href="#">Privacy Policy</a> | <a href="#">Unsubscribe</a></p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
        throw new Error(emailResponse.error.message);
    }

    return { success: true, message: `Project creation email sent to ${project.clientEmail}` };
  } catch (error: any) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message || 'Failed to send email.' };
  }
}
