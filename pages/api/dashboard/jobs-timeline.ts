import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';
import { logError } from '@/lib/logger';

type TypedClient = SupabaseClient<Database>;

interface TimelineJob {
  id: string;
  title: string;
  scheduled_at: string;
  site: { id: string; name: string } | null;
  assignee: { id: string; name: string } | null;
  eta_status: 'on-time' | 'at-risk' | 'late';
}

interface AtRiskJob {
  id: string;
  title: string;
  scheduled_at: string;
  site: { id: string; name: string } | null;
  priority: string;
}

interface JobsTimelineResponse {
  upcoming: TimelineJob[];
  unassigned: AtRiskJob[];
  at_risk: AtRiskJob[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JobsTimelineResponse | { error: string }>
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

    const nowIso = new Date().toISOString();

    // Upcoming jobs: scheduled or in_progress
    const { data: upcomingJobs, error: upcomingError } = await typed
      .from('jobs')
      .select(
        `
        id,
        title,
        scheduled_at,
        priority,
        status,
        site_id,
        job_assignments (
          user:users ( id, full_name, email )
        )
      `
      )
      .eq('org_id', user.org_id!)
      .in('status', ['scheduled', 'in_progress'])
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .limit(50);

    if (upcomingError) {
      throw upcomingError;
    }

    const upcoming: TimelineJob[] = [];
    const unassigned: AtRiskJob[] = [];
    const atRisk: AtRiskJob[] = [];

    const now = new Date();

    // Fetch all sites for the org to avoid null issues with joins
    const { data: allSites, error: sitesError } = await typed
      .from('sites')
      .select('id, name')
      .eq('org_id', user.org_id!);

    if (sitesError) {
      logError('Error fetching sites', sitesError);
    }

    // Create a map of site_id -> site for quick lookup
    const sitesMap = new Map<string, { id: string; name: string }>();
    if (allSites) {
      for (const site of allSites) {
        sitesMap.set(site.id, { id: site.id, name: site.name });
      }
    }

    if (upcomingJobs) {
      for (const job of upcomingJobs as any[]) {
        const scheduledAt = job.scheduled_at
          ? new Date(job.scheduled_at)
          : null;

        let eta: TimelineJob['eta_status'] = 'on-time';
        if (scheduledAt) {
          const diffMinutes =
            (scheduledAt.getTime() - now.getTime()) / (1000 * 60);
          if (diffMinutes < 0) {
            eta = 'late';
          } else if (diffMinutes < 60) {
            eta = 'at-risk';
          }
        }

        const assignments = job.job_assignments as
          | { user: { id: string; full_name: string | null; email: string } }[]
          | null;

        const primaryAssignment =
          assignments && assignments.length > 0 ? assignments[0] : null;

        // Get site data from the map
        const siteData = job.site_id && sitesMap.has(job.site_id)
          ? sitesMap.get(job.site_id)!
          : null;

        upcoming.push({
          id: job.id,
          title: job.title,
          scheduled_at: job.scheduled_at,
          site: siteData,
          assignee: primaryAssignment
            ? {
                id: primaryAssignment.user.id,
                name:
                  primaryAssignment.user.full_name ||
                  primaryAssignment.user.email.split('@')[0],
              }
            : null,
          eta_status: eta,
        });

        if (!primaryAssignment) {
          unassigned.push({
            id: job.id,
            title: job.title,
            scheduled_at: job.scheduled_at,
            site: siteData,
            priority: job.priority,
          });
        }

        if (eta !== 'on-time' || job.priority === 'high' || job.priority === 'urgent') {
          atRisk.push({
            id: job.id,
            title: job.title,
            scheduled_at: job.scheduled_at,
            site: siteData,
            priority: job.priority,
          });
        }
      }
    }

    return res.status(200).json({
      upcoming,
      unassigned,
      at_risk: atRisk,
    });
  } catch (error) {
    logError('Error fetching jobs timeline', error);
    return res.status(500).json({ error: 'Failed to fetch jobs timeline' });
  }
}


