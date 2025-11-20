import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';
import { logError } from '@/lib/logger';

type TypedClient = SupabaseClient<Database>;

type AlertType =
  | 'overdue_job'
  | 'stuck_job'
  | 'proof_missing'
  | 'low_inventory';
type AlertPriority = 'high' | 'medium' | 'low';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  count: number;
  job_ids?: string[];
  priority: AlertPriority;
  link?: string;
}

interface AlertsResponse {
  alerts: Alert[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AlertsResponse | { error: string }>
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

    const now = new Date().toISOString();

    // Basic alerts:
    // - Overdue jobs: scheduled or in_progress where scheduled_at < now
    // - Stuck jobs: in_progress for more than 8 hours (approximation)
    // - Low inventory: items below reorder_level

    const { data: jobs, error: jobsError } = await typed
      .from('jobs')
      .select('id, status, priority, scheduled_at, completed_at')
      .eq('org_id', user.org_id);

    if (jobsError) {
      throw jobsError;
    }

    const alerts: Alert[] = [];

    const overdueJobIds: string[] = [];
    const stuckJobIds: string[] = [];

    if (jobs) {
      const nowDate = new Date(now);

      for (const job of jobs) {
        const scheduledAt = job.scheduled_at
          ? new Date(job.scheduled_at)
          : null;

        if (
          scheduledAt &&
          scheduledAt < nowDate &&
          (job.status === 'scheduled' || job.status === 'in_progress')
        ) {
          overdueJobIds.push(job.id);
        }

        if (job.status === 'in_progress' && scheduledAt) {
          const diffHours =
            (nowDate.getTime() - scheduledAt.getTime()) / (1000 * 60 * 60);
          if (diffHours >= 8) {
            stuckJobIds.push(job.id);
          }
        }
      }
    }

    if (overdueJobIds.length > 0) {
      alerts.push({
        id: 'overdue_jobs',
        type: 'overdue_job',
        title: 'Overdue jobs',
        count: overdueJobIds.length,
        job_ids: overdueJobIds.slice(0, 20),
        priority: 'high',
        link: '/jobs?status=scheduled',
      });
    }

    if (stuckJobIds.length > 0) {
      alerts.push({
        id: 'stuck_jobs',
        type: 'stuck_job',
        title: 'Jobs stuck in progress',
        count: stuckJobIds.length,
        job_ids: stuckJobIds.slice(0, 20),
        priority: 'medium',
        link: '/jobs?status=in_progress',
      });
    }

    // Low inventory
    const { data: lowInventory, error: inventoryError } = await typed
      .from('inventory_items')
      .select('id')
      .lt('quantity_available', 'reorder_level')
      .limit(50);

    if (!inventoryError && lowInventory && lowInventory.length > 0) {
      alerts.push({
        id: 'low_inventory',
        type: 'low_inventory',
        title: 'Items below reorder level',
        count: lowInventory.length,
        priority: 'medium',
        link: '/inventory',
      });
    }

    return res.status(200).json({ alerts });
  } catch (error) {
    logError('Error fetching dashboard alerts', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard alerts' });
  }
}
