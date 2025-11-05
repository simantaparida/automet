import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  try {
    // Check organizations
    const { data: orgs, error: orgsError } = await supabaseAdmin
      .from('organizations')
      .select('*');

    // Check users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');

    // Check jobs
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('*');

    // Check clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*');

    return res.status(200).json({
      organizations: orgs?.length || 0,
      users: users?.length || 0,
      jobs: jobs?.length || 0,
      clients: clients?.length || 0,
      orgs_data: orgs || [],
      users_data: users || [],
      errors: {
        orgs: orgsError?.message,
        users: usersError?.message,
        jobs: jobsError?.message,
        clients: clientsError?.message,
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
