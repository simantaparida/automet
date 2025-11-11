import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { logError } from '@/lib/logger';

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logError: jest.fn(),
}));

const mockedCreateServerSupabaseClient =
  createServerSupabaseClient as jest.MockedFunction<
    typeof createServerSupabaseClient
  >;

const mockedLogError = logError as jest.Mock;

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

const createSupabaseMock = () => {
  const getSession = jest.fn();
  const maybeSingle = jest.fn();
  const eq = jest.fn(() => ({
    maybeSingle,
  }));
  const select = jest.fn(() => ({
    eq,
  }));
  const from = jest.fn(() => ({
    select,
  }));

  const supabase = {
    auth: { getSession },
    from,
  };

  return { supabase, getSession, maybeSingle };
};

describe('withAuth', () => {
  const baseReq = { headers: {} } as NextApiRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns authenticated user when session and profile are present', async () => {
    const res = createResponse();
    const { supabase, getSession, maybeSingle } = createSupabaseMock();

    mockedCreateServerSupabaseClient.mockReturnValue(supabase as never);
    getSession.mockResolvedValue({
      data: {
        session: { user: { id: 'user-1', email: 'session@example.com' } },
      },
      error: null,
    });
    maybeSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'profile@example.com',
        org_id: 'org-1',
        role: 'owner',
      },
      error: null,
    });

    const result = await withAuth(baseReq, res);

    expect(result.authenticated).toBe(true);
    if (result.authenticated) {
      expect(result.user).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'profile@example.com',
          org_id: 'org-1',
          role: 'owner',
        })
      );
    }
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when no session is found', async () => {
    const res = createResponse();
    const { supabase, getSession } = createSupabaseMock();

    mockedCreateServerSupabaseClient.mockReturnValue(supabase as never);
    getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await withAuth(baseReq, res);

    expect(result).toEqual({ authenticated: false });
    expect(res.status).toHaveBeenCalledWith(401);
    const jsonCalls = (res.json as jest.Mock).mock.calls as Array<[unknown]>;
    expect(jsonCalls).not.toHaveLength(0);
    const jsonPayload = jsonCalls[0][0] as { error?: string };
    expect(jsonPayload?.error).toBe('Unauthorized');
  });

  it('returns 403 when profile lookup fails', async () => {
    const res = createResponse();
    const { supabase, getSession, maybeSingle } = createSupabaseMock();

    mockedCreateServerSupabaseClient.mockReturnValue(supabase as never);
    getSession.mockResolvedValue({
      data: {
        session: { user: { id: 'user-1', email: 'session@example.com' } },
      },
      error: null,
    });
    maybeSingle.mockResolvedValue({
      data: null,
      error: new Error('profile missing'),
    });

    const result = await withAuth(baseReq, res);

    expect(result).toEqual({ authenticated: false });
    expect(mockedLogError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    const jsonCalls = (res.json as jest.Mock).mock.calls as Array<[unknown]>;
    expect(jsonCalls).not.toHaveLength(0);
    const jsonPayload = jsonCalls[0][0] as { error?: string };
    expect(jsonPayload?.error).toBe('Forbidden');
  });

  it('handles unexpected errors and returns 500', async () => {
    const res = createResponse();
    mockedCreateServerSupabaseClient.mockImplementation(() => {
      throw new Error('boom');
    });

    const result = await withAuth(baseReq, res);

    expect(result).toEqual({ authenticated: false });
    expect(mockedLogError).toHaveBeenCalledWith(
      'Authentication middleware error:',
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    const jsonCalls = (res.json as jest.Mock).mock.calls as Array<[unknown]>;
    expect(jsonCalls).not.toHaveLength(0);
    const jsonPayload = jsonCalls[0][0] as { error?: string };
    expect(jsonPayload?.error).toBe('Internal Server Error');
  });
});

describe('requireRole', () => {
  let res: NextApiResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createResponse();
  });

  it('returns true when role is allowed', () => {
    const allowed = requireRole(
      { id: '1', email: 'user@example.com', org_id: 'org-1', role: 'owner' },
      ['owner', 'coordinator'],
      res
    );

    expect(allowed).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns false and sends 403 when role is not allowed', () => {
    const allowed = requireRole(
      {
        id: '1',
        email: 'user@example.com',
        org_id: 'org-1',
        role: 'technician',
      },
      ['owner', 'coordinator'],
      res
    );

    expect(allowed).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
    const jsonCalls = (res.json as jest.Mock).mock.calls as Array<[unknown]>;
    expect(jsonCalls).not.toHaveLength(0);
    const jsonPayload = jsonCalls[0][0] as { message?: string };
    expect(jsonPayload?.message).toContain('owner, coordinator');
  });
});
