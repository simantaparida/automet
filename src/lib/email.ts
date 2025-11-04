/**
 * Email service abstraction using Resend
 * In development: logs emails to console
 * In production: sends via Resend API
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@automet.in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend or log to console in dev mode
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const isDev = process.env.NODE_ENV === 'development';

  // Development mode: log to console
  if (isDev || !resend) {
    console.log('\n📧 ===== EMAIL (DEV MODE) =====');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('---');
    console.log(params.text || 'No text version');
    console.log('=============================\n');
    return true;
  }

  // Production mode: send via Resend
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

/**
 * Send pre-order confirmation email with verification link
 */
export async function sendPreorderConfirmation(
  email: string,
  contactName: string,
  confirmationToken: string
): Promise<boolean> {
  const confirmationUrl = `${APP_URL}/preorder/confirm?token=${confirmationToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your Automet pre-order</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Automet</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Field Service Management</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Confirm your pre-order</h2>

    <p>Hi ${contactName},</p>

    <p>Thank you for reserving your spot for Automet early access! 🎉</p>

    <p style="background: white; padding: 20px; border-left: 4px solid #2563eb; border-radius: 4px;">
      Click the button below to confirm your email address:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Confirm Email →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      Or copy and paste this link into your browser:<br>
      <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">${confirmationUrl}</a>
    </p>

    <p style="color: #ef4444; font-size: 14px;">
      ⚠️ This link expires in 7 days.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <h3 style="color: #1f2937;">What happens next?</h3>
    <ul style="color: #4b5563;">
      <li>We'll keep you updated on our launch progress</li>
      <li>You'll get beta access 2 weeks before public launch (Feb 2026)</li>
      <li>Priority onboarding support when we launch</li>
    </ul>

    <p style="margin-top: 30px;">Questions? Just reply to this email.</p>

    <p style="color: #6b7280; margin-top: 30px; margin-bottom: 0;">
      Best,<br>
      <strong>The Automet Team</strong>
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>Automet - Built for Indian AMC Vendors</p>
    <p>
      <a href="${APP_URL}" style="color: #6b7280; text-decoration: none;">Visit Website</a> •
      <a href="${APP_URL}/blog" style="color: #6b7280; text-decoration: none;">Blog</a> •
      <a href="mailto:hello@automet.in" style="color: #6b7280; text-decoration: none;">Contact</a>
    </p>
  </div>

</body>
</html>`;

  const text = `
Confirm your Automet pre-order

Hi ${contactName},

Thank you for reserving your spot for Automet early access!

Click to confirm your email:
${confirmationUrl}

This link expires in 7 days.

What happens next:
- We'll keep you updated on our launch progress
- You'll get beta access 2 weeks before public launch
- Priority onboarding when we launch in Feb 2026

Questions? Reply to this email.

Best,
The Automet Team

---
${APP_URL}
`;

  return sendEmail({
    to: email,
    subject: 'Confirm your Automet pre-order',
    html,
    text,
  });
}

/**
 * Send payment confirmation email after ₹499 payment
 */
export async function sendPaymentConfirmation(
  email: string,
  contactName: string,
  paymentId: string,
  amount: number
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment received - Automet Early Access</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payment Confirmed!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">You're now a Founding Member</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi ${contactName},</p>

    <p>We've received your payment of <strong>₹${amount}</strong>. Welcome to the Automet Founding Members club! 🚀</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1f2937; margin-top: 0;">Your Early Bird Benefits:</h3>
      <ul style="color: #4b5563; padding-left: 20px;">
        <li><strong>6 months Pro plan FREE</strong> (Feb-July 2026) - Worth ₹5,994</li>
        <li><strong>Lifetime 30% discount</strong> on Pro subscription</li>
        <li><strong>Priority support & onboarding</strong></li>
        <li><strong>Beta access 2 weeks early</strong></li>
        <li>Name in our <strong>Founding Members</strong> list (optional)</li>
      </ul>
    </div>

    <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Payment ID:</strong> ${paymentId}<br>
        <strong>Amount:</strong> ₹${amount}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <h3 style="color: #1f2937;">What's Next?</h3>
    <ol style="color: #4b5563;">
      <li><strong>January 2026:</strong> We'll email you beta access credentials</li>
      <li><strong>Mid-January:</strong> Personal onboarding session (1-on-1)</li>
      <li><strong>February 2026:</strong> Official launch - you're already set up!</li>
    </ol>

    <p style="margin-top: 30px;">We'll keep you updated every step of the way. Feel free to reach out anytime!</p>

    <p style="color: #6b7280; margin-top: 30px; margin-bottom: 0;">
      Best,<br>
      <strong>The Automet Team</strong>
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>Need help? Email us at hello@automet.in</p>
  </div>

</body>
</html>`;

  const text = `
Payment Confirmed - You're a Founding Member!

Hi ${contactName},

We've received your payment of ₹${amount}. Welcome to the Automet Founding Members club!

Your Early Bird Benefits:
✓ 6 months Pro plan FREE (Feb-July 2026) - Worth ₹5,994
✓ Lifetime 30% discount on Pro subscription
✓ Priority support & onboarding
✓ Beta access 2 weeks early
✓ Name in Founding Members list (optional)

Payment Details:
Payment ID: ${paymentId}
Amount: ₹${amount}
Date: ${new Date().toLocaleDateString('en-IN')}

What's Next?
1. January 2026: Beta access credentials
2. Mid-January: Personal onboarding (1-on-1)
3. February 2026: Official launch

Best,
The Automet Team

---
Need help? hello@automet.in
`;

  return sendEmail({
    to: email,
    subject: 'Payment received - Your Automet early access is confirmed! 🎉',
    html,
    text,
  });
}
