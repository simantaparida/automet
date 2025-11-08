import type { NextApiRequest, NextApiResponse } from 'next';
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
}));

const insertMock = jest.fn().mockResolvedValue({ error: null });
const fromMock = jest.fn(() => ({
  insert: insertMock,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: fromMock,
  })),
}));

// Import after mocks are defined so they receive the mocked implementations
const handler = require('../../pages/api/contact').default as (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
const { sendEmail } = require('@/lib/email') as {
  sendEmail: jest.Mock;
};

describe('POST /api/contact', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ insert: insertMock });
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    process.env.SUPPORT_EMAIL = 'support@example.com';
    (sendEmail as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createResponse = () => {
    const res: Partial<NextApiResponse> = {};
    res.status = jest.fn().mockImplementation(function (this: NextApiResponse) {
      return this;
    });
    res.json = jest.fn().mockImplementation(function (this: NextApiResponse) {
      return this;
    });
    return res as NextApiResponse;
  };

  it('rejects payloads missing required fields', async () => {
    const req = {
      method: 'POST',
      body: {
        name: 'Simanta',
        company: '',
        country_code: '+91',
        phone: '7008099715',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Company is required'),
      })
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('stores normalized contact details and triggers notification email', async () => {
    const req = {
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
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Simanta Parida',
        company: 'Pilot Partner',
        country_code: '+91',
        phone: '+917008099715',
        email: 'simanta@example.com',
        topic: 'features',
      })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'support@example.com',
        subject: expect.stringContaining('Simanta Parida'),
      })
    );
  });
});

