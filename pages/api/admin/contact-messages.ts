/**
 * Admin Contact Messages API
 * GET /api/admin/contact-messages - Fetch all contact form submissions
 * PATCH /api/admin/contact-messages - Update message status
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin secret
  const adminSecret = req.headers['x-admin-secret'] as string;
  const validAdminSecret = process.env.ADMIN_SECRET;

  // Debug logging
  console.log('Admin Secret Check:', {
    receivedSecret: adminSecret ? `${adminSecret.substring(0, 3)}...` : 'MISSING',
    hasValidSecret: !!validAdminSecret,
    validSecretPreview: validAdminSecret ? `${validAdminSecret.substring(0, 3)}...` : 'NOT_SET',
    match: adminSecret === validAdminSecret,
  });

  if (!validAdminSecret) {
    return res.status(500).json({
      success: false,
      message: 'ADMIN_SECRET environment variable is not configured on the server',
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
      // Fetch all contact messages
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const { data: messages, error } = await (supabase as any)
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch contact messages:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch contact messages',
          error: error.message,
        });
      }

      // Type assertion for messages
      const typedMessages = (messages || []) as ContactMessage[];

      // Calculate stats
      const stats: ContactMessagesStats = {
        total: typedMessages.length,
        new: typedMessages.filter((m) => m.status === 'new').length,
        in_progress: typedMessages.filter((m) => m.status === 'in_progress').length,
        resolved: typedMessages.filter((m) => m.status === 'resolved').length,
      };

      return res.status(200).json({
        success: true,
        data: typedMessages,
        stats,
      });
    } catch (error) {
      console.error('Contact messages API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, status, notes } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: id and status',
        });
      }

      const validStatuses = ['new', 'in_progress', 'resolved', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: new, in_progress, resolved, or archived',
        });
      }

      const updateData: {
        status: string;
        updated_at: string;
        resolved_at?: string;
        notes?: string;
      } = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const { data, error } = await (supabase as any)
        .from('contact_messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update contact message:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update message',
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
        message: 'Message updated successfully',
      });
    } catch (error) {
      console.error('Contact messages update API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}

