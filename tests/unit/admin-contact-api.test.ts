import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/admin/contact-messages';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { setupSupabaseAdminMock } from '../utils/supabase';

jest.mock('@/lib/logger', () => ({
  logDev: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseAdmin: jest.fn(),
}));

const mockedGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<
  typeof getSupabaseAdmin
>;
const adminHelper = setupSupabaseAdminMock(mockedGetSupabaseAdmin);

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

describe('Admin contact messages API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    adminHelper.reset();
    process.env = { ...originalEnv, ADMIN_SECRET: 'super-secret' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns messages with stats when GET succeeds', async () => {
    const builder = adminHelper.getBuilder('contact_messages');
    const messages = [
      {
        id: '1',
        name: 'Demo User',
        company: 'Automet Labs',
        country_code: '+91',
        phone: '+910000000000',
        email: 'demo@example.com',
        topic: 'demo',
        message: 'Interested in a demo',
        status: 'new',
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null,
        notes: null,
      },
    ];

    builder.order.mockResolvedValue({ data: messages, error: null });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req: Partial<NextApiRequest> = {
      method: 'GET',
      headers: { 'x-admin-secret': 'super-secret' },
      query: {},
    };
    const res = createResponse();

    await handler(req as NextApiRequest, res);

    expect(builder.select).toHaveBeenCalledWith('*');
    expect(builder.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.arrayContaining([
          expect.objectContaining({ id: '1', status: 'new' }),
        ]),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        stats: expect.objectContaining({ total: 1, new: 1 }),
      })
    );
  });

  it('updates a contact message when PATCH payload is valid', async () => {
    const builder = adminHelper.getBuilder('contact_messages');
    const updatedMessage = {
      id: 'message-123',
      name: 'QA Lead',
      company: 'Automet Labs',
      country_code: '+91',
      phone: '+911234567890',
      email: 'qa@example.com',
      topic: 'features',
      message: 'Please send more info',
      status: 'resolved',
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
      notes: 'Followed up on Slack',
    };

    builder.maybeSingle.mockResolvedValue({
      data: updatedMessage,
      error: null,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req: Partial<NextApiRequest> = {
      method: 'PATCH',
      headers: { 'x-admin-secret': 'super-secret' },
      body: {
        id: 'message-123',
        status: 'resolved',
        notes: 'Followed up on Slack',
      },
    };
    const res = createResponse();

    await handler(req as NextApiRequest, res);

    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'resolved',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updated_at: expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        resolved_at: expect.any(String),
        notes: 'Followed up on Slack',
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          id: 'message-123',
          status: 'resolved',
        }),
      })
    );
  });

  it('rejects requests with missing admin secret', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req: Partial<NextApiRequest> = {
      method: 'GET',
      headers: {},
      query: {},
    };
    const res = createResponse();

    await handler(req as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: expect.stringContaining('No admin secret'),
      })
    );
  });
});
