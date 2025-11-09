import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/inventory/index';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { setupSupabaseAdminMock } from '../utils/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-server';

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

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseAdmin: jest.fn(),
}));

const mockedCreateServerSupabaseClient =
  createServerSupabaseClient as jest.MockedFunction<
    typeof createServerSupabaseClient
  >;

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

describe('Inventory API', () => {
  const originalEnv = process.env;
  const supabaseBuilder = adminHelper.getBuilder('inventory_items');

  beforeEach(() => {
    jest.clearAllMocks();
    adminHelper.reset();
    mockedCreateServerSupabaseClient.mockReturnValue({
      from: jest.fn(() => supabaseBuilder),
    } as never);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns inventory items and filters low stock when requested', async () => {
    const now = new Date().toISOString();
    supabaseBuilder.select.mockReturnValue(supabaseBuilder);
    supabaseBuilder.order.mockResolvedValue({
      data: [
        {
          id: 'item-1',
          org_id: 'org-1',
          item_name: 'Wrench',
          category: 'Tools',
          sku: null,
          unit_of_measure: 'pcs',
          quantity_available: 10,
          reorder_level: 5,
          unit_cost: null,
          notes: null,
          created_at: now,
          updated_at: now,
        },
        {
          id: 'item-2',
          org_id: 'org-1',
          item_name: 'Screws',
          category: 'Hardware',
          sku: null,
          unit_of_measure: 'pcs',
          quantity_available: 2,
          reorder_level: 4,
          unit_cost: null,
          notes: null,
          created_at: now,
          updated_at: now,
        },
      ],
      error: null,
    });

    const req = {
      method: 'GET',
      query: { low_stock: 'true' },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'item-2', item_name: 'Screws' }),
    ]);
  });

  it('creates inventory item with normalized payload', async () => {
    mockedCreateServerSupabaseClient.mockReturnValue({
      from: jest.fn(() => supabaseBuilder),
    } as never);

    const newItem = {
      id: 'item-99',
      org_id: 'org-1',
      item_name: 'Ladder',
      category: 'Equipment',
      sku: null,
      unit_of_measure: 'pcs',
      quantity_available: 0,
      reorder_level: 0,
      unit_cost: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    supabaseBuilder.insert.mockReturnValue(supabaseBuilder);
    supabaseBuilder.select.mockReturnValue(supabaseBuilder);
    supabaseBuilder.maybeSingle.mockResolvedValue({
      data: newItem,
      error: null,
    });

    const req = {
      method: 'POST',
      body: {
        item_name: '  Ladder ',
        category: ' Equipment ',
        unit_of_measure: 'pcs',
        quantity_available: '0',
        reorder_level: '',
      },
    } as unknown as NextApiRequest;
    const res = createResponse();

    await handler(req, res);

    expect(supabaseBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        item_name: 'Ladder',
        category: 'Equipment',
        org_id: 'org-1',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        quantity_available: 0,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        reorder_level: 0,
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'item-99',
        item_name: 'Ladder',
      })
    );
  });
});
