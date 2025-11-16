import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';
import { logError } from '@/lib/logger';

type TypedClient = SupabaseClient<Database>;

type ActivityType =
  | 'job_completed'
  | 'job_created'
  | 'client_added'
  | 'technician_added'
  | 'proof_uploaded';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: { id: string; name: string };
  link?: string;
}

interface ActivityResponse {
  activities: ActivityItem[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActivityResponse | { error: string }>
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

    const activities: ActivityItem[] = [];

    // Recent completed jobs
    const { data: completedJobs, error: completedError } = await typed
      .from('jobs')
      .select('id, title, completed_at')
      .eq('org_id', user.org_id!)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (!completedError && completedJobs) {
      for (const job of completedJobs) {
        activities.push({
          id: `job_completed_${job.id}`,
          type: 'job_completed',
          title: 'Job completed',
          description: job.title,
          timestamp: job.completed_at as string,
          link: `/jobs/${job.id}`,
        });
      }
    }

    // Recent created jobs
    const { data: createdJobs, error: createdError } = await typed
      .from('jobs')
      .select('id, title, created_at')
      .eq('org_id', user.org_id!)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!createdError && createdJobs) {
      for (const job of createdJobs) {
        activities.push({
          id: `job_created_${job.id}`,
          type: 'job_created',
          title: 'New job created',
          description: job.title,
          timestamp: job.created_at as string,
          link: `/jobs/${job.id}`,
        });
      }
    }

    // New clients
    const { data: clients, error: clientsError } = await typed
      .from('clients')
      .select('id, name, created_at')
      .eq('org_id', user.org_id!)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!clientsError && clients) {
      for (const client of clients) {
        activities.push({
          id: `client_added_${client.id}`,
          type: 'client_added',
          title: 'New client added',
          description: client.name,
          timestamp: client.created_at as string,
          link: `/clients/${client.id}`,
        });
      }
    }

    // New technicians
    const { data: technicians, error: techniciansError } = await typed
      .from('users')
      .select('id, full_name, email, created_at')
      .eq('org_id', user.org_id!)
      .eq('role', 'technician')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!techniciansError && technicians) {
      for (const tech of technicians) {
        activities.push({
          id: `technician_added_${tech.id}`,
          type: 'technician_added',
          title: 'Technician joined',
          description: tech.full_name || tech.email,
          timestamp: tech.created_at as string,
        });
      }
    }

    // Sort all activities by timestamp desc and cap to 25
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      activities: activities.slice(0, 25),
    });
  } catch (error) {
    logError('Error fetching dashboard activity', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch dashboard activity' });
  }
}


