/**
 * Zod validation schemas for pre-order landing page
 * Validates form inputs server-side to prevent malicious data
 */

import { z } from 'zod';

/**
 * Pre-order form schema
 * Validates user input for pre-order booking
 */
export const preorderSchema = z.object({
  org_name: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(200, 'Organization name must be less than 200 characters'),

  contact_name: z
    .string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must be less than 100 characters'),

  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),

  phone: z
    .string()
    .trim()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),

  tech_count: z
    .number()
    .int('Number of technicians must be a whole number')
    .positive('Number of technicians must be positive')
    .max(1000, 'Please contact us for teams larger than 1000')
    .optional(),

  city: z
    .string()
    .trim()
    .max(100, 'City name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  plan_interest: z
    .enum(['free', 'pro', 'enterprise'], {
      errorMap: () => ({ message: 'Please select a valid plan' }),
    })
    .optional(),

  // UTM tracking parameters
  utm_source: z.string().trim().max(100).optional().or(z.literal('')),
  utm_medium: z.string().trim().max(100).optional().or(z.literal('')),
  utm_campaign: z.string().trim().max(100).optional().or(z.literal('')),
  referrer: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Payment verification schema
 * Validates Razorpay payment webhook data
 */
export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

/**
 * Email confirmation schema
 * Validates confirmation token from email link
 */
export const confirmationSchema = z.object({
  token: z.string().min(20, 'Invalid confirmation token'),
});

// TypeScript types inferred from schemas
export type PreorderInput = z.infer<typeof preorderSchema>;
export type PaymentVerification = z.infer<typeof paymentVerificationSchema>;
export type ConfirmationToken = z.infer<typeof confirmationSchema>;
