import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { id } = req.query;

  // Validate id parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  const jobId = id;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { assignment_id, action, notes } = req.body;

    if (!assignment_id || !action) {
      return res
        .status(400)
        .json({ error: 'assignment_id and action are required' });
    }

    if (action !== 'checkin' && action !== 'checkout') {
      return res
        .status(400)
        .json({ error: 'action must be "checkin" or "checkout"' });
    }

    const updates: Database['public']['Tables']['job_assignments']['Update'] = {
      updated_at: new Date().toISOString(),
    };

    if (action === 'checkin') {
      updates.started_at = new Date().toISOString();
    } else if (action === 'checkout') {
      updates.completed_at = new Date().toISOString();
      if (notes) {
        updates.notes = notes;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('job_assignments')
      .update(updates)
      .eq('id', assignment_id)
      .eq('job_id', jobId)
      .select(
        `
        id,
        started_at,
        completed_at,
        notes,
        user:users(id, email, role)
      `
      )
      .single();

    if (error) throw error;

    // If checking in, auto-update job status to in_progress
    if (action === 'checkin') {
      const jobUpdate: Database['public']['Tables']['jobs']['Update'] = {
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      };
      await supabaseAdmin
        .from('jobs')
        .update(jobUpdate)
        .eq('id', jobId);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating check-in/out:', error);
    return res.status(500).json({ error: error.message });
  }
}
