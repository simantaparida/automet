import { z } from 'zod';

/**
 * Environment Variable Validation Schema
 * Validates all required environment variables at runtime
 *
 * @usage Import this file at app startup to validate env vars
 */

const envSchema = z.object({
  // Supabase (Required)
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(20, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY is required for server-side operations'),

  // Google OAuth (Required for OAuth login)
  GOOGLE_CLIENT_ID: z.string().min(10, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(10, 'GOOGLE_CLIENT_SECRET is required'),

  // Razorpay (Required for payments)
  RZ_KEY_ID: z.string().startsWith('rzp_', 'RZ_KEY_ID must start with rzp_'),
  RZ_KEY_SECRET: z.string().min(10, 'RZ_KEY_SECRET is required'),
  RZ_WEBHOOK_SECRET: z.string().min(10, 'RZ_WEBHOOK_SECRET is required'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .startsWith('rzp_', 'NEXT_PUBLIC_RAZORPAY_KEY_ID must start with rzp_'),

  // Email Service (Required for notifications)
  RESEND_API_KEY: z.string().min(10, 'RESEND_API_KEY is required'),
  SENDGRID_FROM_EMAIL: z.string().email('SENDGRID_FROM_EMAIL must be a valid email'),

  // Email Confirmation
  EMAIL_TOKEN_SECRET: z
    .string()
    .min(32, 'EMAIL_TOKEN_SECRET must be at least 32 characters'),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Optional: Database Direct Connection
  DATABASE_URL: z.string().url().optional(),

  // Optional: Error Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables
 * @throws {Error} If validation fails with detailed error messages
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Environment variable validation failed:\n\n${errorMessages}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
    );
  }

  return result.data;
}

/**
 * Validated environment variables
 * Call validateEnv() at app startup to ensure all vars are valid
 */
export const env = validateEnv();
