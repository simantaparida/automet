import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';

type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];

type ParsedUpdatePayload = any;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isInventoryItemRow = (value: unknown): value is InventoryItemRow => {
  if (!isRecord(value)) {
    return false;
  }

  const {
    id,
    org_id,
    name,
    sku,
    unit,
    quantity,
    reorder_level,
    is_serialized,
    updated_at,
    created_at,
  } = value;

  // More lenient validation - allow numeric types to be strings (from database)
  // PostgreSQL numeric types can be returned as strings
  const quantityNum =
    typeof quantity === 'number'
      ? quantity
      : typeof quantity === 'string'
        ? Number(quantity)
        : null;
  const reorderLevelNum =
    typeof reorder_level === 'number'
      ? reorder_level
      : typeof reorder_level === 'string'
        ? Number(reorder_level)
        : null;

  return (
    typeof id === 'string' &&
    typeof org_id === 'string' &&
    typeof name === 'string' &&
    (typeof sku === 'string' || sku === null) &&
    (typeof unit === 'string' || unit === null) &&
    ((quantityNum !== null && !isNaN(quantityNum)) || quantity === null) &&
    ((reorderLevelNum !== null && !isNaN(reorderLevelNum)) ||
      reorder_level === null) &&
    typeof is_serialized === 'boolean' &&
    (typeof updated_at === 'string' ||
      updated_at === null ||
      updated_at instanceof Date) &&
    (typeof created_at === 'string' || created_at instanceof Date)
  );
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

const parseUpdatePayload = (
  payload: unknown
): { ok: true; data: ParsedUpdatePayload } | { ok: false; message: string } => {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Invalid payload format.' };
  }

  const itemName = typeof payload.name === 'string' ? payload.name.trim() : '';

  if (!itemName) {
    return {
      ok: false,
      message: 'name is required.',
    };
  }

  const sku =
    typeof payload.sku === 'string' && payload.sku.trim() !== ''
      ? payload.sku.trim()
      : null;

  const unit =
    typeof payload.unit === 'string' && payload.unit.trim() !== ''
      ? payload.unit.trim()
      : null;

  const quantity = toNullableNumber(payload.quantity);
  const reorderLevel = toNullableNumber(payload.reorder_level);
  const isSerialized =
    typeof payload.is_serialized === 'boolean' ? payload.is_serialized : false;

  return {
    ok: true,
    data: {
      name: itemName,
      sku,
      unit,
      quantity,
      reorder_level: reorderLevel,
      is_serialized: isSerialized,
    },
  };
};

const isValidId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { supabase } = authResult;
  const typedClient = supabase as unknown as SupabaseClient<Database>;

  const { id } = req.query;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid inventory item ID' });
  }

  const itemId = id;

  if (req.method === 'GET') {
    try {
      const { data: item, error: itemError } = await typedClient
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      if (itemError) {
        logError('Error fetching inventory item:', itemError);
        return res.status(500).json({
          error: 'Failed to fetch inventory item',
          message: itemError.message,
          code: itemError.code,
        });
      }

      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Return the item - validation is lenient enough to handle database types
      // The frontend will handle any type conversions needed
      return res.status(200).json({ item });
    } catch (error) {
      logError('Error fetching inventory item:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const parsed = parseUpdatePayload(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ error: parsed.message });
      }

      const updatePayload: InventoryItemUpdate = {
        ...parsed.data,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await typedClient
        .from('inventory_items')
        .update(updatePayload)
        .eq('id', itemId)
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!isInventoryItemRow(data)) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      return res.status(200).json(data);
    } catch (error) {
      logError('Error updating inventory item:', error);
      return res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { data, error } = await typedClient
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      const deletedData: unknown = data;
      if (!Array.isArray(deletedData) || deletedData.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      return res
        .status(200)
        .json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
      logError('Error deleting inventory item:', error);
      return res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
