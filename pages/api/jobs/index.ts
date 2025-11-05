import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';

/**
 * Jobs API Route (Protected)
 * GET /api/jobs - List jobs with optional filters
 * POST /api/jobs - Create a new job (requires owner or coordinator role)
 *
 * @security Requires authentication
 * @security RLS policies enforced - users can only see jobs in their org
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate user
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) return;

  const { user } = authResult;
  const supabase = createServerSupabaseClient<Database>({ req, res });

  try {
    if (req.method === 'GET') {
      return await handleGetJobs(req, res, supabase);
    } else if (req.method === 'POST') {
      // Only owners and coordinators can create jobs
      if (!requireRole(user, ['owner', 'coordinator'], res)) return;
      return await handleCreateJob(req, res, supabase, user);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Jobs API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/jobs
 * Query params:
 * - status: filter by status (scheduled, in_progress, completed, cancelled)
 * - priority: filter by priority (low, medium, high, urgent)
 * - client_id: filter by client
 * - limit: number of results (default 50)
 * - offset: pagination offset (default 0)
 */
async function handleGetJobs(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: ReturnType<typeof createServerSupabaseClient<Database>>
) {
  const { status, priority, client_id, limit = '50', offset = '0' } = req.query;

  // RLS policies automatically filter by user's org_id
  let query = supabase
    .from('jobs')
    .select(
      `
      *,
      client:clients(id, name),
      site:sites(id, name, address),
      asset:assets(id, asset_type, model, serial_number),
      assignments:job_assignments(
        id,
        user:users(id, email, role)
      )
    `
    )
    .order('scheduled_at', { ascending: false })
    .range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  if (priority) {
    query = query.eq('priority', priority);
  }
  if (client_id) {
    query = query.eq('client_id', client_id);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    jobs: data || [],
    total: count || data?.length || 0,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });
}

/**
 * POST /api/jobs
 * Body: {
 *   client_id: string,
 *   site_id: string,
 *   asset_id?: string,
 *   title: string,
 *   description?: string,
 *   priority: 'low' | 'medium' | 'high' | 'urgent',
 *   scheduled_at: string (ISO date),
 * }
 */
async function handleCreateJob(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: ReturnType<typeof createServerSupabaseClient<Database>>,
  user: { id: string; org_id: string; role: string }
) {
  const {
    client_id,
    site_id,
    asset_id,
    title,
    description,
    priority = 'medium',
    scheduled_at,
  } = req.body;

  // Validation
  if (!client_id || !site_id || !title || !scheduled_at) {
    return res.status(400).json({
      error: 'Missing required fields: client_id, site_id, title, scheduled_at',
    });
  }

  // RLS policies automatically enforce org_id from authenticated user
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      org_id: user.org_id, // Use authenticated user's org_id
      client_id,
      site_id,
      asset_id: asset_id || null,
      title,
      description: description || null,
      priority,
      status: 'scheduled',
      scheduled_at,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ job: data });
}
