/**
 * Admin Contact Messages API
 * GET /api/admin/contact-messages - Fetch all contact form submissions
 * PATCH /api/admin/contact-messages - Update message status
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { logDev, logError } from '@/lib/logger';

interface ContactMessageRow {
  id: string;
  name: string;
  email: string | null;
  topic: string | null;
  message: string | null;
  status: AllowedStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  notes: string | null;
}

interface ContactMessagesStats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
}

const ALLOWED_STATUSES = [
  'new',
  'in_progress',
  'resolved',
  'archived',
] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseUpdatePayload = (
  payload: unknown
): { id: string; status: AllowedStatus; notes?: string | null } | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { id, status, notes } = payload;

  if (typeof id !== 'string' || typeof status !== 'string') {
    return null;
  }

  if (!ALLOWED_STATUSES.includes(status as AllowedStatus)) {
    return null;
  }

  let normalizedNotes: string | null | undefined;
  if (typeof notes === 'string') {
    normalizedNotes = notes;
  } else if (notes === null) {
    normalizedNotes = null;
  }

  return { id, status: status as AllowedStatus, notes: normalizedNotes };
};

const toStats = (messages: ContactMessageRow[]): ContactMessagesStats => {
  let newCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;

  for (const message of messages) {
    if (message.status === 'new') {
      newCount += 1;
    } else if (message.status === 'in_progress') {
      inProgressCount += 1;
    } else if (message.status === 'resolved') {
      resolvedCount += 1;
    }
  }

  return {
    total: messages.length,
    new: newCount,
    in_progress: inProgressCount,
    resolved: resolvedCount,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const adminSecret = req.headers['x-admin-secret'] as string | undefined;
  const validAdminSecret = process.env.ADMIN_SECRET;

  logDev('Admin Secret Check:', {
    receivedSecret: adminSecret
      ? `${adminSecret.substring(0, 3)}...`
      : 'MISSING',
    hasValidSecret: Boolean(validAdminSecret),
    validSecretPreview: validAdminSecret
      ? `${validAdminSecret.substring(0, 3)}...`
      : 'NOT_SET',
    match: adminSecret === validAdminSecret,
  });

  if (!validAdminSecret) {
    return res.status(500).json({
      success: false,
      message:
        'ADMIN_SECRET environment variable is not configured on the server',
    });
  }

  if (!adminSecret) {
    return res.status(401).json({
      success: false,
      message: 'No admin secret provided in request headers',
    });
  }

  if (adminSecret !== validAdminSecret) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin secret - password does not match',
    });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: 'Admin client not configured. Service role key required.',
    });
  }

  if (req.method === 'GET') {
    try {
      const { data: messages, error } = await supabase
        .from('contact_messages')
        .select<ContactMessageRow[]>('*')
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch contact messages:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch contact messages',
          error: error.message,
        });
      }

      const typedMessages: ContactMessageRow[] = Array.isArray(messages)
        ? messages.filter((message): message is ContactMessageRow => {
            if (!isRecord(message)) {
              return false;
            }

            const {
              id,
              name,
              email,
              topic,
              message: body,
              status,
              created_at,
              updated_at,
              resolved_at,
              notes,
            } = message;

            return (
              typeof id === 'string' &&
              typeof name === 'string' &&
              (typeof email === 'string' || email === null) &&
              (typeof topic === 'string' || topic === null) &&
              (typeof body === 'string' || body === null) &&
              typeof status === 'string' &&
              ALLOWED_STATUSES.includes(status as AllowedStatus) &&
              typeof created_at === 'string' &&
              typeof updated_at === 'string' &&
              (typeof resolved_at === 'string' || resolved_at === null) &&
              (typeof notes === 'string' || notes === null)
            );
          })
        : [];

      return res.status(200).json({
        success: true,
        data: typedMessages,
        stats: toStats(typedMessages),
      });
    } catch (error) {
      logError('Contact messages API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updatePayload = parseUpdatePayload(req.body);

      if (!updatePayload) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid payload. Provide id, status, and optionally notes (string or null).',
        });
      }

      const { id, status, notes } = updatePayload;

      const updateData: {
        status: AllowedStatus;
        updated_at: string;
        resolved_at: string | null;
        notes?: string | null;
      } = {
        status,
        updated_at: new Date().toISOString(),
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      };

      if (typeof notes !== 'undefined') {
        updateData.notes = notes;
      }

      const { data: updatedMessage, error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', id)
        .select<ContactMessageRow>('*')
        .maybeSingle();

      if (error) {
        logError('Failed to update contact message:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update message',
          error: error.message,
        });
      }

      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedMessage,
        message: 'Message updated successfully',
      });
    } catch (error) {
      logError('Contact messages update API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}
