import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/sites/index';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/auth-middleware', () => ({
  withAuth: jest.fn().mockResolvedValue({
    authenticated: true,
    user: { id: 'user-1', org_id: 'org-1', role: 'owner' },
  }),
  requireRole: jest.fn(() => true),
}));

jest.mock('@/lib/logger', () => ({
  logError: jest.fn(),
}));

type QueryResult = {
  data: unknown;
  error: unknown;
};

interface SupabaseSitesBuilder extends PromiseLike<QueryResult> {
  select: jest.Mock<SupabaseSitesBuilder, [string]>;
  order: jest.Mock<SupabaseSitesBuilder, [string, { ascending: boolean }]>;
  eq: jest.Mock<SupabaseSitesBuilder, [string, unknown]>;
  insert: jest.Mock<SupabaseSitesBuilder, [unknown]>;
  maybeSingle: jest.Mock<Promise<{ data: unknown; error: unknown }>, []>;
  setResult: (result: QueryResult) => void;
  reset: () => void;
}

const createSitesBuilder = (): SupabaseSitesBuilder => {
  const builder: Partial<SupabaseSitesBuilder> & {
    __result: QueryResult;
  } = {
    __result: { data: [], error: null },
    then(onFulfilled) {
      return Promise.resolve(builder.__result).then(onFulfilled);
    },
    select: jest.fn(),
    order: jest.fn(),
    eq: jest.fn(),
    insert: jest.fn(),
    maybeSingle: jest.fn(),
    setResult(result: QueryResult) {
      builder.__result = result;
    },
    reset() {
      builder.select
        ?.mockReset()
        .mockReturnValue(builder as SupabaseSitesBuilder);
      builder.order
        ?.mockReset()
        .mockReturnValue(builder as SupabaseSitesBuilder);
      builder.eq?.mockReset().mockReturnValue(builder as SupabaseSitesBuilder);
      builder.insert
        ?.mockReset()
        .mockReturnValue(builder as SupabaseSitesBuilder);
      builder.maybeSingle?.mockReset();
      builder.__result = { data: [], error: null };
    },
  };

  builder.reset();
  builder.maybeSingle?.mockResolvedValue({ data: null, error: null });

  return builder as SupabaseSitesBuilder;
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

describe('Sites API', () => {
  const originalEnv = process.env;
  const sitesBuilder = createSitesBuilder();

  beforeEach(() => {
    jest.clearAllMocks();
    sitesBuilder.reset();
    mockedCreateServerSupabaseClient.mockReturnValue({
      from: jest.fn(() => sitesBuilder),
    } as never);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns filtered sites when clientId provided', async () => {
    const now = new Date().toISOString();
    const site = {
      id: 'site-1',
      org_id: 'org-1',
      client_id: 'client-1',
      name: 'Main Plant',
      address: 'Industrial Road',
      gps_lat: null,
      gps_lng: null,
      notes: null,
      created_at: now,
      updated_at: now,
      client: { id: 'client-1', name: 'ACME Corp' },
    };

    sitesBuilder.setResult({ data: [site, { invalid: true }], error: null });

    const req = {
      method: 'GET',
      query: { client_id: 'client-1' },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(sitesBuilder.select).toHaveBeenCalled();
    expect(sitesBuilder.order).toHaveBeenCalledWith('name', {
      ascending: true,
    });
    expect(sitesBuilder.eq).toHaveBeenCalledWith('client_id', 'client-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'site-1', name: 'Main Plant' }),
    ]);
  });

  it('creates a site with normalized payload', async () => {
    const createdSite = {
      id: 'site-99',
      org_id: 'org-1',
      client_id: 'client-1',
      name: 'Warehouse',
      address: null,
      gps_lat: null,
      gps_lng: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    sitesBuilder.insert.mockReturnValue(sitesBuilder);
    sitesBuilder.select.mockReturnValue(sitesBuilder);
    sitesBuilder.maybeSingle.mockResolvedValue({
      data: createdSite,
      error: null,
    });

    const req = {
      method: 'POST',
      body: {
        client_id: ' client-1 ',
        name: ' Warehouse ',
        address: '',
        gps_lat: '',
        gps_lng: '',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(requireRole).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'owner' }),
      ['owner', 'coordinator'],
      res
    );
    expect(sitesBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        client_id: expect.stringContaining('client-1'),
        name: 'Warehouse',
        org_id: 'org-1',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'site-99',
        name: 'Warehouse',
      })
    );
  });

  it('returns 400 for invalid payloads', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
      method: 'POST',
      body: {
        client_id: '',
        name: '',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: expect.stringContaining('client_id and name are required'),
      })
    );
    expect(logError).not.toHaveBeenCalled();
  });
});
