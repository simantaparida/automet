/**
 * Contact Support API
 * POST /api/contact - Send contact form submission
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import { sendEmail } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { logError, logWarn } from '@/lib/logger';

const ALLOWED_TOPICS = [
  'pricing',
  'features',
  'technical',
  'demo',
  'partnership',
  'other',
] as const;
type AllowedTopic = (typeof ALLOWED_TOPICS)[number];

type ContactMessageInsert =
  Database['public']['Tables']['contact_messages']['Insert'];

type ContactParseSuccess = {
  ok: true;
  record: ContactMessageInsert;
  topicLabel: string;
  phoneDisplay: string;
};

type ContactParseFailure = { ok: false; message: string };

const topicLabels: Record<AllowedTopic, string> = {
  pricing: 'Pricing & Plans',
  features: 'Features & Capabilities',
  technical: 'Technical Support',
  demo: 'Request a Demo',
  partnership: 'Partnership Inquiry',
  other: 'Other Questions',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseContactPayload = (
  payload: unknown
): ContactParseSuccess | ContactParseFailure => {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Invalid payload format.' };
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const company =
    typeof payload.company === 'string' ? payload.company.trim() : '';
  const countryCode =
    typeof payload.country_code === 'string'
      ? payload.country_code.trim()
      : '+91';
  const rawPhone =
    typeof payload.phone === 'string' ? payload.phone.replace(/\D/g, '') : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const topic =
    typeof payload.topic === 'string' &&
    ALLOWED_TOPICS.includes(payload.topic as AllowedTopic)
      ? (payload.topic as AllowedTopic)
      : null;
  const message =
    typeof payload.message === 'string' ? payload.message.trim() : '';

  if (!name) {
    return { ok: false, message: 'Name is required.' };
  }

  if (name.length < 2) {
    return { ok: false, message: 'Name must be at least 2 characters.' };
  }

  if (!company) {
    return { ok: false, message: 'Company is required.' };
  }

  if (company.length < 2) {
    return { ok: false, message: 'Company must be at least 2 characters.' };
  }

  if (!/^\+\d{1,4}$/.test(countryCode)) {
    return { ok: false, message: 'Please select a valid country code.' };
  }

  if (!/^\d{10}$/.test(rawPhone)) {
    return {
      ok: false,
      message: 'Phone number must be a valid 10-digit number.',
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }

  if (message && message.length < 10) {
    return {
      ok: false,
      message: 'Message must be at least 10 characters when provided.',
    };
  }

  const fullPhone = `${countryCode}${rawPhone}`;
  const topicLabel = topic ? topicLabels[topic] : 'General inquiry';
  const normalizedMessage = message || null;
  const normalizedEmail = email || null;
  const record: ContactMessageInsert = {
    name,
    company,
    country_code: countryCode,
    phone: fullPhone,
    email: normalizedEmail,
    topic,
    message: normalizedMessage,
    status: 'new',
  };

  return {
    ok: true,
    record,
    topicLabel,
    phoneDisplay: `${countryCode} ${rawPhone}`,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsed = parseContactPayload(req.body);

    if (!parsed.ok) {
      return res.status(400).json({
        error: 'Validation failed',
        message: parsed.message,
      });
    }

    const { topicLabel, phoneDisplay, record: contactRecord } = parsed;

    // Store in database (best effort)
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        logWarn(
          'Contact form submission not stored - SUPABASE_SERVICE_ROLE_KEY missing'
        );
      } else {
        const { error: dbError } = await supabase
          .from('contact_messages')
          .insert(contactRecord);

        if (dbError) {
          logError('Failed to store contact message in DB:', dbError);
        }
      }
    } catch (dbError) {
      logError('Database error storing contact message:', dbError);
    }

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@automet.app';
    const emailSubject = contactRecord.topic
      ? `[Contact Form - ${topicLabel}] New message from ${contactRecord.name}`
      : `[Contact Form] New message from ${contactRecord.name}`;

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
            <p style="margin: 5px 0 0 0; color: #4b5563;">${contactRecord.name}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${contactRecord.company}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${phoneDisplay}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">${
              contactRecord.email ?? 'No email provided'
            }</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #EF7722; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937; margin-bottom: 10px;">Message:</p>
            <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${
              contactRecord.message ?? 'No additional message provided.'
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

From: ${contactRecord.name}
Company: ${contactRecord.company}
Phone: ${phoneDisplay}
Email: ${contactRecord.email ?? 'No email provided'}

Message:
${contactRecord.message ?? 'No additional message provided.'}

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
      logError('Failed to send contact form email');
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
    logError('Contact form API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}
