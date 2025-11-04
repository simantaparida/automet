import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { assignment_id, action, notes } = req.body;

    if (!assignment_id || !action) {
      return res.status(400).json({ error: 'assignment_id and action are required' });
    }

    if (action !== 'checkin' && action !== 'checkout') {
      return res.status(400).json({ error: 'action must be "checkin" or "checkout"' });
    }

    const updates: any = {
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
      .eq('job_id', id)
      .select(`
        id,
        started_at,
        completed_at,
        notes,
        user:users(id, email, role)
      `)
      .single();

    if (error) throw error;

    // If checking in, auto-update job status to in_progress
    if (action === 'checkin') {
      await supabaseAdmin
        .from('jobs')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating check-in/out:', error);
    return res.status(500).json({ error: error.message });
  }
}
