import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';

type TypedClient = SupabaseClient<Database>;

interface KpiResponse {
  scheduled: { count: number; trend?: number };
  in_progress: { count: number; longest_running_hours?: number };
  completed: { count: number; trend?: number };
  overdue: { count: number };
  proof_pending: { count: number; high_priority_count: number };
  unassigned: { count: number };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KpiResponse | { error: string }>
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

    // Determine effective role
    // We need to import getEffectiveRole or implement similar logic if not available in this scope
    // Since we can't easily import without checking exports, let's check user.activeRole or user.role
    const effectiveRole = user.activeRole || user.role;

    const query = typed
      .from('jobs')
      .select(
        `
        id, 
        status, 
        priority, 
        scheduled_at, 
        completed_at,
        assignments:job_assignments(user_id)
      `
      )
      .eq('org_id', user.org_id);

    const { data: jobs, error } = await query;

    if (error) {
      throw error;
    }

    const now = new Date();

    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;
    let unassigned = 0;

    let longestRunningHours = 0;

    // We don't yet track proof explicitly here – keep counts at 0 but
    // structure matches what the dashboard expects.
    const proofPending = 0;
    const proofPendingHighPriority = 0;

    if (jobs) {
      for (const job of jobs) {
        // Filter for technician: only count if assigned
        if (effectiveRole === 'technician') {
          const isAssigned = (job as any).assignments?.some(
            (a: { user_id: string }) => a.user_id === user.id
          );
          if (!isAssigned) continue;
        }

        if (job.status === 'scheduled') {
          scheduled += 1;

          const scheduledAt = job.scheduled_at
            ? new Date(job.scheduled_at)
            : null;
          if (scheduledAt && scheduledAt < now) {
            overdue += 1;
          }
        } else if (job.status === 'in_progress') {
          inProgress += 1;

          const startedAt = job.scheduled_at
            ? new Date(job.scheduled_at)
            : null;
          if (startedAt) {
            const diffHours =
              (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);
            if (diffHours > longestRunningHours) {
              longestRunningHours = diffHours;
            }
          }
        } else if (job.status === 'completed') {
          completed += 1;
        }
      }
    }

    // Compute unassigned count using job_assignments
    // Technicians shouldn't see unassigned jobs count usually, or it should be 0
    if (effectiveRole !== 'technician') {
      const { data: unassignedJobs, error: unassignedError } = await typed
        .from('jobs')
        .select('id')
        .eq('org_id', user.org_id)
        .in('status', ['scheduled', 'in_progress'])
        .not('id', 'in', typed.from('job_assignments').select('job_id'));

      if (!unassignedError && unassignedJobs) {
        unassigned = unassignedJobs.length;
      }
    }

    const response: KpiResponse = {
      scheduled: { count: scheduled },
      in_progress: {
        count: inProgress,
        longest_running_hours:
          longestRunningHours > 0 ? Number(longestRunningHours.toFixed(1)) : 0,
      },
      completed: { count: completed },
      overdue: { count: overdue },
      proof_pending: {
        count: proofPending,
        high_priority_count: proofPendingHighPriority,
      },
      unassigned: { count: unassigned },
    };

    return res.status(200).json(response);
  } catch (error) {
    logError('Error fetching dashboard KPIs', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
  }
}
