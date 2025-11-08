import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/jobs/index';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/auth-middleware', () => ({
  withAuth: jest.fn(() =>
    Promise.resolve({
      authenticated: true,
      user: { id: 'user-1', org_id: 'org-1', role: 'owner' },
    })
  ),
  requireRole: jest.fn(() => true),
}));

jest.mock('@/lib/logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
}));

type QueryResult = {
  data: unknown;
  error: unknown;
  count?: number | null;
};

interface SupabaseJobsBuilder extends PromiseLike<QueryResult> {
  select: jest.Mock<SupabaseJobsBuilder, [string, Record<string, unknown>?]>;
  order: jest.Mock<SupabaseJobsBuilder, [string, { ascending: boolean }]>;
  range: jest.Mock<SupabaseJobsBuilder, [number, number]>;
  eq: jest.Mock<SupabaseJobsBuilder, [string, unknown]>;
  insert: jest.Mock<SupabaseJobsBuilder, [unknown]>;
  maybeSingle: jest.Mock<Promise<{ data: unknown; error: unknown }>, []>;
  setResult: (result: QueryResult) => void;
  reset: () => void;
}

const createJobsBuilder = (): SupabaseJobsBuilder => {
  const builder: Partial<SupabaseJobsBuilder> & {
    __result: QueryResult;
  } = {
    __result: { data: [], error: null, count: 0 },
    then(onFulfilled) {
      return Promise.resolve(builder.__result).then(onFulfilled);
    },
    select: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    eq: jest.fn(),
    insert: jest.fn(),
    maybeSingle: jest.fn(),
    setResult(result: QueryResult) {
      builder.__result = result;
    },
    reset() {
      builder.select
        ?.mockReset()
        .mockReturnValue(builder as SupabaseJobsBuilder);
      builder.order
        ?.mockReset()
        .mockReturnValue(builder as SupabaseJobsBuilder);
      builder.range
        ?.mockReset()
        .mockReturnValue(builder as SupabaseJobsBuilder);
      builder.eq?.mockReset().mockReturnValue(builder as SupabaseJobsBuilder);
      builder.insert
        ?.mockReset()
        .mockReturnValue(builder as SupabaseJobsBuilder);
      builder.maybeSingle?.mockReset();
      builder.__result = { data: [], error: null, count: 0 };
    },
  };

  builder.reset();

  builder.maybeSingle?.mockResolvedValue({ data: null, error: null });

  return builder as SupabaseJobsBuilder;
};

const mockedCreateServerSupabaseClient =
  createServerSupabaseClient as jest.MockedFunction<
    typeof createServerSupabaseClient
  >;

const createResponse = () => {
  const res = {} as NextApiResponse;
  res.status = jest.fn().mockImplementation(function (this: NextApiResponse) {
    return this;
  });
  res.json = jest.fn().mockImplementation(function (this: NextApiResponse) {
    return this;
  });
  return res;
};

describe('Jobs API', () => {
  const originalEnv = process.env;
  const jobsBuilder = createJobsBuilder();

  beforeEach(() => {
    jest.clearAllMocks();
    jobsBuilder.reset();
    mockedCreateServerSupabaseClient.mockReturnValue({
      from: jest.fn(() => jobsBuilder),
    } as never);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns filtered jobs with pagination metadata', async () => {
    const now = new Date().toISOString();
    const validJob = {
      id: 'job-1',
      org_id: 'org-1',
      client_id: 'client-1',
      site_id: 'site-1',
      asset_id: null,
      title: 'Install sensors',
      description: null,
      status: 'scheduled',
      priority: 'high',
      scheduled_at: now,
      completed_at: null,
      created_at: now,
      updated_at: now,
      client: { id: 'client-1', name: 'ACME Corp' },
      site: { id: 'site-1', name: 'Plant 1', address: 'Industrial Road' },
      asset: null,
      assignments: [],
    };

    jobsBuilder.setResult({
      data: [validJob, { invalid: 'entry' }],
      error: null,
      count: 5,
    });

    const req = {
      method: 'GET',
      query: {
        status: 'scheduled',
        priority: 'high',
        client_id: 'client-1',
        limit: '25',
        offset: '5',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(jobsBuilder.select).toHaveBeenCalled();
    expect(jobsBuilder.order).toHaveBeenCalledWith('scheduled_at', {
      ascending: false,
    });
    expect(jobsBuilder.range).toHaveBeenCalledWith(5, 29);
    expect(jobsBuilder.eq).toHaveBeenCalledWith('status', 'scheduled');
    expect(jobsBuilder.eq).toHaveBeenCalledWith('priority', 'high');
    expect(jobsBuilder.eq).toHaveBeenCalledWith('client_id', 'client-1');
    expect(res.status).toHaveBeenCalledWith(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(res.json).toHaveBeenCalledWith({
      jobs: [expect.objectContaining({ id: 'job-1' })],
      total: 5,
      limit: 25,
      offset: 5,
    });
  });

  it('creates a new job with normalized payload', async () => {
    const createdJob = {
      id: 'job-99',
      org_id: 'org-1',
      client_id: 'client-1',
      site_id: 'site-1',
      asset_id: null,
      title: 'Install HVAC',
      description: 'Urgent installation',
      status: 'scheduled',
      priority: 'medium',
      scheduled_at: '2025-01-01T10:00:00.000Z',
      completed_at: null,
      created_at: '2025-01-01T08:00:00.000Z',
      updated_at: null,
    };

    jobsBuilder.insert.mockReturnValue(jobsBuilder);
    jobsBuilder.select.mockReturnValue(jobsBuilder);
    jobsBuilder.maybeSingle.mockResolvedValue({
      data: createdJob,
      error: null,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
      method: 'POST',
      body: {
        client_id: ' client-1 ',
        site_id: 'site-1',
        asset_id: '',
        title: ' Install HVAC ',
        description: 'Urgent installation',
        priority: 'medium',
        scheduled_at: '2025-01-01T10:00:00.000Z',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(requireRole).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'owner' }),
      ['owner', 'coordinator'],
      res
    );
    expect(jobsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        client_id: expect.stringContaining('client-1'),
        site_id: 'site-1',
        asset_id: null,
        title: 'Install HVAC',
        priority: 'medium',
        status: 'scheduled',
        org_id: 'org-1',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(res.json).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      job: expect.objectContaining({
        id: 'job-99',
        title: 'Install HVAC',
      }),
    });
  });

  it('returns 400 when payload validation fails', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
      method: 'POST',
      body: {
        client_id: '',
        site_id: '',
        title: '',
        scheduled_at: '',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: expect.stringContaining('Missing required fields'),
      })
    );
    expect(logError).not.toHaveBeenCalled();
  });
});
