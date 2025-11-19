import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';
import { logError } from '@/lib/logger';

type TypedClient = SupabaseClient<Database>;

interface Technician {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: 'active' | 'idle' | 'offline';
  jobs_count_today: number;
  last_checkin_at?: string;
}

interface TechniciansResponse {
  technicians: Technician[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TechniciansResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;

  try {
    const typed = supabase as unknown as TypedClient;

    // Fetch technicians in this org
    const { data: users, error: usersError } = await typed
      .from('users')
      .select('id, email, full_name, role, org_id')
      .eq('org_id', user.org_id!)
      .eq('role', 'technician');

    if (usersError) {
      throw usersError;
    }

    const technicians: Technician[] = [];

    if (users && users.length > 0) {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      ).toISOString();

      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      ).toISOString();

      const technicianIds = users.map((u) => u.id);

      // Count jobs assigned to each technician today
      const { data: todaysJobs, error: jobsError } = await typed
        .from('jobs')
        .select(
          `
          id,
          scheduled_at,
          status,
          org_id,
          job_assignments:job_assignments ( user_id )
        `
        )
        .eq('org_id', user.org_id!)
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay)
        .in('status', ['scheduled', 'in_progress']);

      if (jobsError) {
        throw jobsError;
      }

      const jobsCountByTech: Record<string, number> = {};

      if (todaysJobs) {
        for (const job of todaysJobs as any[]) {
          const assignments = job.job_assignments as { user_id: string }[] | null;
          if (!assignments) continue;

          for (const assignment of assignments) {
            if (technicianIds.includes(assignment.user_id)) {
              jobsCountByTech[assignment.user_id] =
                (jobsCountByTech[assignment.user_id] ?? 0) + 1;
            }
          }
        }
      }

      for (const tech of users) {
        const jobsToday = jobsCountByTech[tech.id] ?? 0;

        const status: Technician['status'] =
          jobsToday > 0 ? 'active' : 'idle';

        technicians.push({
          id: tech.id,
          name: tech.full_name || tech.email?.split('@')[0] || 'Unknown',
          email: tech.email,
          status,
          jobs_count_today: jobsToday,
          last_checkin_at: undefined,
        });
      }
    }

    return res.status(200).json({ technicians });
  } catch (error) {
    logError('Error fetching dashboard technicians', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch dashboard technicians' });
  }
}


