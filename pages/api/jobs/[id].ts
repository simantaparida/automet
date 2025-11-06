import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

/**
 * Individual Job API Route
 * GET /api/jobs/[id] - Get job details
 * PATCH /api/jobs/[id] - Update job
 * DELETE /api/jobs/[id] - Delete job
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  try {
    if (req.method === 'GET') {
      return await handleGetJob(id, res);
    } else if (req.method === 'PATCH') {
      return await handleUpdateJob(id, req, res);
    } else if (req.method === 'DELETE') {
      return await handleDeleteJob(id, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Job API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/jobs/[id]
 */
async function handleGetJob(id: string, res: NextApiResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select(
      `
      *,
      client:clients(id, name, contact_email, contact_phone, address),
      site:sites(id, name, address, gps_lat, gps_lng, metadata),
      asset:assets(id, asset_type, model, serial_number, metadata),
      assignments:job_assignments(
        id,
        started_at,
        completed_at,
        notes,
        user:users(id, email, role)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Job not found' });
    }
    console.error('Error fetching job:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ job: data });
}

/**
 * PATCH /api/jobs/[id]
 * Body: Partial job fields to update
 */
async function handleUpdateJob(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const updates = req.body;

  // Don't allow updating org_id or id
  delete updates.org_id;
  delete updates.id;
  delete updates.created_at;

  // Add updated_at
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('jobs')
    // @ts-expect-error - Supabase type inference issue with update
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Job not found' });
    }
    console.error('Error updating job:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ job: data });
}

/**
 * DELETE /api/jobs/[id]
 */
async function handleDeleteJob(id: string, res: NextApiResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id);

  if (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Job deleted successfully' });
}
