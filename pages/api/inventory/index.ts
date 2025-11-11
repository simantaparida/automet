import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import { logError, logWarn } from '@/lib/logger';

type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNullableString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

const toNumberOrDefault = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseCreatePayload = (
  payload: unknown
):
  | {
      ok: true;
      data: Omit<InventoryItemInsert, 'org_id'>;
    }
  | { ok: false; message: string } => {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Invalid payload format.' };
  }

  const itemName =
    typeof payload.item_name === 'string' ? payload.item_name.trim() : '';
  const category =
    typeof payload.category === 'string' ? payload.category.trim() : '';
  const unitOfMeasure =
    typeof payload.unit_of_measure === 'string'
      ? payload.unit_of_measure.trim()
      : '';

  if (!itemName || !category || !unitOfMeasure) {
    return {
      ok: false,
      message: 'item_name, category, and unit_of_measure are required.',
    };
  }

  return {
    ok: true,
    data: {
      item_name: itemName,
      category,
      sku: toNullableString(payload.sku),
      unit_of_measure: unitOfMeasure,
      quantity_available: toNumberOrDefault(payload.quantity_available, 0),
      reorder_level: toNumberOrDefault(payload.reorder_level, 0),
      unit_cost: toNullableNumber(payload.unit_cost),
      notes: toNullableString(payload.notes),
    },
  };
};

const isLowStockQuery = (value: unknown): boolean =>
  value === 'true' || value === true;

const isInventoryItem = (value: unknown): value is InventoryItemRow =>
  isRecord(value) &&
  typeof value.item_name === 'string' &&
  typeof value.category === 'string' &&
  typeof value.unit_of_measure === 'string';

/**
 * Inventory API Route (Protected)
 * GET /api/inventory - List all inventory items
 * POST /api/inventory - Create a new inventory item (requires owner or coordinator role)
 *
 * @security Requires authentication
 * @security RLS policies enforced - users can only see inventory in their org
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user } = authResult;
  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  }) as unknown as SupabaseClient<Database>;

  if (req.method === 'GET') {
    try {
      const { low_stock } = req.query;

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('item_name', { ascending: true });

      if (error) {
        throw error;
      }

      const items: InventoryItemRow[] = [];
      if (Array.isArray(data)) {
        for (const entry of data) {
          if (isInventoryItem(entry)) {
            items.push(entry);
          }
        }
      }

      if (!isLowStockQuery(low_stock)) {
        return res.status(200).json(items);
      }

      const lowStockItems: InventoryItemRow[] = [];
      for (const item of items) {
        const quantity = item.quantity_available ?? 0;
        const reorderLevel = item.reorder_level ?? 0;
        if (quantity <= reorderLevel) {
          lowStockItems.push(item);
        }
      }

      return res.status(200).json(lowStockItems);
    } catch (error) {
      logError('Inventory API fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch inventory',
      });
    }
  }

  if (req.method === 'POST') {
    if (!requireRole(user, ['owner', 'coordinator'], res)) {
      return;
    }

    try {
      const parsed = parseCreatePayload(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ error: parsed.message });
      }

      const payload: InventoryItemInsert = {
        ...parsed.data,
        org_id: user.org_id,
      };

      const createResponse = await supabase
        .from('inventory_items')
        .insert(payload)
        .select('*')
        .maybeSingle();

      if (createResponse.error) {
        throw createResponse.error;
      }

      const createdItem: unknown = createResponse.data;

      if (!isInventoryItem(createdItem)) {
        logWarn('Inventory item creation returned no data');
        return res.status(500).json({
          error: 'Inventory item created but no data returned',
        });
      }

      return res.status(201).json(createdItem);
    } catch (error) {
      logError('Create inventory error:', error);
      return res.status(500).json({
        error: 'Failed to create inventory item',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
