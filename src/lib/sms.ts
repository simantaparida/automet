/**
 * SMS service abstraction
 * In development: logs SMS to console
 * In production: sends via SMS provider (Twilio/MSG91/Exotel)
 */

import { logDev, logError } from './logger';

// SMS provider configuration
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'twilio'; // 'twilio' | 'msg91' | 'exotel'

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// MSG91 configuration (India-specific)
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'AUTOMT';

interface SendSMSParams {
  to: string;
  message: string;
}

/**
 * Send SMS via configured provider or log to console in dev mode
 * @param params - SMS parameters
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendSMS(params: SendSMSParams): Promise<boolean> {
  const isDev = process.env.NODE_ENV === 'development';

  // Development mode: log to console
  if (isDev) {
    logDev('\n📱 ===== SMS (DEV MODE) =====');
    logDev('To:', params.to);
    logDev('---');
    logDev(params.message);
    logDev('===========================\n');
    return true;
  }

  // Production mode: send via configured provider
  try {
    switch (SMS_PROVIDER) {
      case 'twilio':
        return await sendViaTwilio(params);
      case 'msg91':
        return await sendViaMSG91(params);
      case 'exotel':
        return await sendViaExotel(params);
      default:
        logError('Unknown SMS provider:', SMS_PROVIDER);
        return false;
    }
  } catch (error) {
    logError('SMS send error:', error);
    return false;
  }
}

/**
 * Send SMS via Twilio
 */
async function sendViaTwilio(params: SendSMSParams): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    logError('Twilio credentials not configured');
    return false;
  }

  try {
    // Lazy load twilio to avoid requiring it in dev
    const twilio = (await import('twilio')).default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const result = await client.messages.create({
      to: params.to,
      from: TWILIO_PHONE_NUMBER,
      body: params.message,
    });

    logDev('Twilio SMS sent:', result.sid);
    return true;
  } catch (error) {
    logError('Twilio SMS error:', error);
    return false;
  }
}

/**
 * Send SMS via MSG91 (India-specific provider)
 */
async function sendViaMSG91(params: SendSMSParams): Promise<boolean> {
  if (!MSG91_AUTH_KEY) {
    logError('MSG91 auth key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        sender: MSG91_SENDER_ID,
        route: '4', // Transactional route
        country: '91',
        sms: [
          {
            message: params.message,
            to: [params.to.replace('+91', '')], // Remove +91 prefix
          }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
      logError('MSG91 SMS error:', data);
      return false;
    }

    logDev('MSG91 SMS sent:', data);
    return true;
  } catch (error) {
    logError('MSG91 SMS error:', error);
    return false;
  }
}

/**
 * Send SMS via Exotel (India-specific provider)
 */
async function sendViaExotel(params: SendSMSParams): Promise<boolean> {
  const EXOTEL_SID = process.env.EXOTEL_SID;
  const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN;
  const EXOTEL_SENDER_ID = process.env.EXOTEL_SENDER_ID;

  if (!EXOTEL_SID || !EXOTEL_TOKEN || !EXOTEL_SENDER_ID) {
    logError('Exotel credentials not configured');
    return false;
  }

  try {
    const auth = Buffer.from(`${EXOTEL_SID}:${EXOTEL_TOKEN}`).toString('base64');

    const response = await fetch(
      `https://api.exotel.com/v1/Accounts/${EXOTEL_SID}/Sms/send.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: EXOTEL_SENDER_ID,
          To: params.to,
          Body: params.message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      logError('Exotel SMS error:', data);
      return false;
    }

    logDev('Exotel SMS sent:', data);
    return true;
  } catch (error) {
    logError('Exotel SMS error:', error);
    return false;
  }
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation: +<country code><number>
  // India: +91 followed by 10 digits
  const phoneRegex = /^\+\d{1,4}\d{7,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number for display
 * @param phone - Phone number (e.g., "+919876543210")
 * @returns Formatted phone (e.g., "+91 98765 43210")
 */
export function formatPhoneNumber(phone: string): string {
  if (phone.startsWith('+91') && phone.length === 13) {
    // India: +91 98765 43210
    return `${phone.slice(0, 3)} ${phone.slice(3, 8)} ${phone.slice(8)}`;
  }
  return phone;
}

/**
 * Send WhatsApp message (requires WhatsApp Business API)
 * Note: This requires WhatsApp Business API setup
 */
export async function sendWhatsApp(params: SendSMSParams): Promise<boolean> {
  // WhatsApp Business API implementation
  // This is a placeholder - actual implementation depends on provider
  logDev('WhatsApp sending not yet implemented');
  return sendSMS(params); // Fallback to SMS for now
}
