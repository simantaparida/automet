/**
 * Contact Support API
 * POST /api/contact - Send contact form submission
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

interface ContactFormData {
  name?: string;
  company?: string;
  country_code?: string;
  phone?: string;
  email?: string | null;
  topic?: string | null;
  message?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      company,
      country_code,
      phone,
      email,
      topic,
      message,
    }: ContactFormData = req.body;

    const trimmedName = (name ?? '').trim();
    const trimmedCompany = (company ?? '').trim();
    const countryCode = (country_code ?? '+91').trim();
    const rawPhone = (phone ?? '').replace(/\D/g, '');
    const trimmedEmail = email?.trim() ?? '';
    const trimmedMessage = message?.trim() ?? '';
    const allowedTopics = new Set([
      'pricing',
      'features',
      'technical',
      'demo',
      'partnership',
      'other',
    ]);

    // Validation
    if (!trimmedName) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name is required.',
      });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be at least 2 characters.',
      });
    }

    if (!trimmedCompany) {
      return res.status(400).json({
        error: 'Invalid company',
        message: 'Company is required.',
      });
    }

    if (trimmedCompany.length < 2) {
      return res.status(400).json({
        error: 'Invalid company',
        message: 'Company must be at least 2 characters.',
      });
    }

    if (!/^\+\d{1,4}$/.test(countryCode)) {
      return res.status(400).json({
        error: 'Invalid country code',
        message: 'Please select a valid country code.',
      });
    }

    if (!/^\d{10}$/.test(rawPhone)) {
      return res.status(400).json({
        error: 'Invalid phone',
        message: 'Phone number must be a valid 10-digit number.',
      });
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please enter a valid email address.',
      });
    }

    const normalizedTopic = topic && allowedTopics.has(topic) ? topic : null;

    if (trimmedMessage && trimmedMessage.length < 10) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message must be at least 10 characters when provided.',
      });
    }

    const fullPhone = `${countryCode}${rawPhone}`;
    const normalizedEmail = trimmedEmail || null;
    const normalizedMessage = trimmedMessage || null;

    // Format topic for display
    const topicLabels: Record<string, string> = {
      pricing: 'Pricing & Plans',
      features: 'Features & Capabilities',
      technical: 'Technical Support',
      demo: 'Request a Demo',
      partnership: 'Partnership Inquiry',
      other: 'Other Questions',
    };
    const topicLabel = normalizedTopic
      ? topicLabels[normalizedTopic] || normalizedTopic
      : 'General inquiry';

    // Store in database
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: dbError } = await supabase
          .from('contact_messages')
          .insert({
            name: trimmedName,
            company: trimmedCompany,
            country_code: countryCode,
            phone: fullPhone,
            email: normalizedEmail,
            topic: normalizedTopic,
            message: normalizedMessage,
            status: 'new',
          });

        if (dbError) {
          console.error('Failed to store contact message in DB:', dbError);
          // Continue anyway - email is the primary notification method
        }
      }
    } catch (dbError) {
      console.error('Database error storing contact message:', dbError);
      // Continue anyway - email is the primary notification method
    }

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@automet.app';
    const emailSubject = normalizedTopic
      ? `[Contact Form - ${topicLabel}] New message from ${trimmedName}`
      : `[Contact Form] New message from ${trimmedName}`;
    const phoneForDisplay = `${countryCode} ${rawPhone}`;
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
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">Topic:</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${topicLabel}</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">From:</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${trimmedName}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${trimmedCompany}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${phoneForDisplay}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${
              normalizedEmail ?? 'No email provided'
            }</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937; margin-bottom: 10px;">Message:</p>
            <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${
              normalizedMessage ?? 'No additional message provided.'
            }</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This message was sent from the Automet contact form.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Contact Form Submission

Topic: ${topicLabel}

From: ${trimmedName}
Company: ${trimmedCompany}
Phone: ${phoneForDisplay}
Email: ${normalizedEmail ?? 'No email provided'}

Message:
${normalizedMessage ?? 'No additional message provided.'}

---
This message was sent from the Automet contact form.
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
          'Unable to send your message. Please try again later or email us directly at support@automet.app',
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
