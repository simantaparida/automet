import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/contact';
import { sendEmail } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { setupSupabaseAdminMock } from '../utils/supabase';

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseAdmin: jest.fn(),
}));

const mockedGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<
  typeof getSupabaseAdmin
>;
const adminHelper = setupSupabaseAdminMock(mockedGetSupabaseAdmin);
const contactMessagesBuilder = adminHelper.getBuilder('contact_messages');
const mockedSendEmail = sendEmail as jest.Mock;

describe('POST /api/contact', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    adminHelper.reset();
    contactMessagesBuilder.insert.mockResolvedValue({ error: null });
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    process.env.SUPPORT_EMAIL = 'support@example.com';
    mockedSendEmail.mockResolvedValue(true);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

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

  it('rejects payloads missing required fields', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req: Partial<NextApiRequest> = {
      method: 'POST',
      body: {
        name: 'Simanta',
        company: '',
        country_code: '+91',
        phone: '7008099715',
      },
    };
    const res = createResponse();

    await handler(req as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: expect.stringContaining('Company is required'),
      })
    );
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it('stores normalized contact details and triggers notification email', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req: Partial<NextApiRequest> = {
      method: 'POST',
      body: {
        name: 'Simanta Parida',
        company: 'Pilot Partner',
        country_code: '+91 ',
        phone: '70080 99715',
        email: 'simanta@example.com',
        topic: 'features',
        message: 'Excited about the pilot program!',
      },
    };
    const res = createResponse();

    await handler(req as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(contactMessagesBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Simanta Parida',
        company: 'Pilot Partner',
        country_code: '+91',
        phone: '+917008099715',
        email: 'simanta@example.com',
        topic: 'features',
        status: 'new',
      })
    );
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'support@example.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        subject: expect.stringContaining('Simanta Parida'),
      })
    );
  });
});
