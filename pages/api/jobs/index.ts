import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import { logError, logWarn } from '@/lib/logger';
import type { Database } from '@/types/database';

const ALLOWED_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
] as const;

const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

type JobStatus = (typeof ALLOWED_STATUSES)[number];
type JobPriority = (typeof ALLOWED_PRIORITIES)[number];

interface JobUser {
  id: string;
  email: string;
  role: string;
}

interface JobAssignment {
  id: string;
  user: JobUser | null;
}

interface JobRelation {
  id: string;
  name: string | null;
  address?: string | null;
  asset_type?: string | null;
  model?: string | null;
  serial_number?: string | null;
}

interface JobRecord {
  id: string;
  org_id: string;
  client_id: string | null;
  site_id: string | null;
  asset_id: string | null;
  title: string;
  description: string | null;
  status: JobStatus;
  priority: JobPriority;
  scheduled_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  client?: JobRelation | null;
  site?: JobRelation | null;
  asset?: JobRelation | null;
  assignments?: JobAssignment[] | null;
}

interface ParsedJobFilters {
  status?: JobStatus;
  priority?: JobPriority;
  clientId?: string;
  limit: number;
  offset: number;
}

interface ParsedJobPayload {
  client_id: string;
  site_id: string;
  asset_id: string | null;
  title: string;
  description: string | null;
  priority: JobPriority;
  scheduled_at: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parsePositiveInt = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return fallback;
};

const parseStringParam = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

const parseStatus = (value: unknown): JobStatus | undefined => {
  if (typeof value === 'string') {
    return ALLOWED_STATUSES.find((status) => status === value);
  }
  return undefined;
};

const parsePriority = (value: unknown): JobPriority | undefined => {
  if (typeof value === 'string') {
    return ALLOWED_PRIORITIES.find((priority) => priority === value);
  }
  return undefined;
};

const parseFilters = (query: NextApiRequest['query']): ParsedJobFilters => {
  const status = parseStatus(query.status);
  const priority = parsePriority(query.priority);
  const clientId = parseStringParam(query.client_id);
  const limit = Math.min(parsePositiveInt(query.limit, 50), 100);
  const offset = parsePositiveInt(query.offset, 0);

  return { status, priority, clientId, limit, offset };
};

const parseJobPayload = (
  payload: unknown
): { ok: true; data: ParsedJobPayload } | { ok: false; message: string } => {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Invalid payload format.' };
  }

  const clientId = parseStringParam(payload.client_id);
  const siteId = parseStringParam(payload.site_id);
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const scheduledAt =
    typeof payload.scheduled_at === 'string' ? payload.scheduled_at : undefined;

  if (!clientId || !siteId || !title || !scheduledAt) {
    return {
      ok: false,
      message:
        'Missing required fields: client_id, site_id, title, scheduled_at.',
    };
  }

  const priority = parsePriority(payload.priority) ?? 'medium';
  const description =
    typeof payload.description === 'string' && payload.description.trim() !== ''
      ? payload.description
      : null;
  const assetId = parseStringParam(payload.asset_id) ?? null;

  return {
    ok: true,
    data: {
      client_id: clientId,
      site_id: siteId,
      asset_id: assetId,
      title,
      description,
      priority,
      scheduled_at: scheduledAt,
    },
  };
};

const isJobAssignment = (value: unknown): value is JobAssignment => {
  if (!isRecord(value) || typeof value.id !== 'string') {
    return false;
  }

  const user = value.user;
  if (user == null) {
    return true;
  }

  return (
    isRecord(user) &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string'
  );
};

const isJobRelation = (value: unknown): value is JobRelation =>
  isRecord(value) && typeof value.id === 'string';

const isJobRecord = (value: unknown): value is JobRecord => {
  if (!isRecord(value)) {
    return false;
  }

  const requiredStringFields = [
    'id',
    'org_id',
    'title',
    'status',
    'priority',
    'scheduled_at',
    'created_at',
  ] as const;

  for (const field of requiredStringFields) {
    if (typeof value[field] !== 'string') {
      return false;
    }
  }

  if (!ALLOWED_STATUSES.includes(value.status as JobStatus)) {
    return false;
  }

  if (!ALLOWED_PRIORITIES.includes(value.priority as JobPriority)) {
    return false;
  }

  if (
    'client' in value &&
    value.client !== undefined &&
    value.client !== null &&
    !isJobRelation(value.client)
  ) {
    return false;
  }

  if (
    'site' in value &&
    value.site !== undefined &&
    value.site !== null &&
    !isJobRelation(value.site)
  ) {
    return false;
  }

  if (
    'asset' in value &&
    value.asset !== undefined &&
    value.asset !== null &&
    !isJobRelation(value.asset)
  ) {
    return false;
  }

  if ('assignments' in value && Array.isArray(value.assignments)) {
    for (const assignment of value.assignments) {
      if (!isJobAssignment(assignment)) {
        return false;
      }
    }
  }

  return true;
};

const normalizeJobResults = (data: unknown): JobRecord[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  const jobs: JobRecord[] = [];
  for (const entry of data) {
    if (isJobRecord(entry)) {
      jobs.push(entry);
    }
  }
  return jobs;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user } = authResult;

  try {
    if (req.method === 'GET') {
      return await handleGetJobs(req, res);
    }

    if (req.method === 'POST') {
      if (!requireRole(user, ['owner', 'coordinator'], res)) {
        return;
      }
      return await handleCreateJob(req, res, user.org_id);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logError('Jobs API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function handleGetJobs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient<Database>({
      req,
      res,
    }) as unknown as SupabaseClient<Database>;
    const filters = parseFilters(req.query);
    const rangeEnd = filters.offset + filters.limit - 1;

    let query = supabase
      .from('jobs')
      .select(
        `
          id,
          org_id,
          client_id,
          site_id,
          asset_id,
          title,
          description,
          status,
          priority,
          scheduled_at,
          completed_at,
          created_at,
          updated_at,
          client:clients(id, name),
          site:sites(id, name, address),
          asset:assets(id, asset_type, model, serial_number),
          assignments:job_assignments(
            id,
            user:users(id, email, role)
          )
        `,
        { count: 'exact' }
      )
      .order('scheduled_at', { ascending: false })
      .range(filters.offset, rangeEnd);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const jobs = normalizeJobResults(data);

    return res.status(200).json({
      jobs,
      total: count ?? jobs.length,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    logError('Error fetching jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

async function handleCreateJob(
  req: NextApiRequest,
  res: NextApiResponse,
  orgId: string
) {
  try {
    const supabase = createServerSupabaseClient<Database>({
      req,
      res,
    }) as unknown as SupabaseClient<Database>;
    const parsed = parseJobPayload(req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.message });
    }

    const jobPayload = {
      ...parsed.data,
      org_id: orgId,
      status: 'scheduled' as JobStatus,
    };

    const response = await supabase
      .from('jobs')
      .insert(jobPayload)
      .select(
        `
          id,
          org_id,
          client_id,
          site_id,
          asset_id,
          title,
          description,
          status,
          priority,
          scheduled_at,
          completed_at,
          created_at,
          updated_at
        `
      )
      .maybeSingle();

    if (response.error) {
      throw response.error;
    }

    const createdJob = response.data;

    if (!isJobRecord(createdJob)) {
      logWarn('Created job has unexpected shape', createdJob);
      return res.status(500).json({
        error: 'Job created but response format was unexpected',
      });
    }

    return res.status(201).json({ job: createdJob });
  } catch (error) {
    logError('Error creating job:', error);
    return res.status(500).json({ error: 'Failed to create job' });
  }
}
