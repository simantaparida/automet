/**
 * Contact Support API
 * POST /api/contact - Send contact form submission
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message }: ContactFormData = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please fill in all required fields.',
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be at least 2 characters.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please enter a valid email address.',
      });
    }

    if (subject.length < 5) {
      return res.status(400).json({
        error: 'Invalid subject',
        message: 'Subject must be at least 5 characters.',
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message must be at least 10 characters.',
      });
    }

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@automet.in';
    const emailSubject = `[Contact Form] ${subject}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #EF7722; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">Subject:</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${subject}</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">From:</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${name} &lt;${email}&gt;</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937; margin-bottom: 10px;">Message:</p>
            <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This message was sent from the Automet contact form on the website.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Contact Form Submission

Subject: ${subject}

From: ${name} <${email}>

Message:
${message}

---
This message was sent from the Automet contact form on the website.
    `;

    const emailSent = await sendEmail({
      to: supportEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    if (!emailSent) {
      console.error('Failed to send contact form email');
      return res.status(500).json({
        error: 'Failed to send message',
        message:
          'Unable to send your message. Please try again later or email us directly at support@automet.in',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully. We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error('Contact form API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}
