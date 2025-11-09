import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { logError, logWarn } from '@/lib/logger';

type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

type ParsedUpdatePayload = Pick<
  InventoryItemRow,
  | 'item_name'
  | 'category'
  | 'unit_of_measure'
  | 'sku'
  | 'quantity_available'
  | 'reorder_level'
  | 'unit_cost'
  | 'notes'
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isInventoryItemRow = (value: unknown): value is InventoryItemRow => {
  if (!isRecord(value)) {
    return false;
  }

  const {
    id,
    org_id,
    item_name,
    category,
    unit_of_measure,
    sku,
    quantity_available,
    reorder_level,
    unit_cost,
    notes,
    updated_at,
    created_at,
  } = value;

  return (
    typeof id === 'string' &&
    typeof org_id === 'string' &&
    typeof item_name === 'string' &&
    typeof category === 'string' &&
    typeof unit_of_measure === 'string' &&
    (typeof sku === 'string' || sku === null) &&
    (typeof quantity_available === 'number' || quantity_available === null) &&
    (typeof reorder_level === 'number' || reorder_level === null) &&
    (typeof unit_cost === 'number' || unit_cost === null) &&
    (typeof notes === 'string' || notes === null) &&
    (typeof updated_at === 'string' || updated_at === null) &&
    typeof created_at === 'string'
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

  const sku =
    typeof payload.sku === 'string' && payload.sku.trim() !== ''
      ? payload.sku.trim()
      : null;

  const quantityAvailable = toNullableNumber(payload.quantity_available);
  const reorderLevel = toNullableNumber(payload.reorder_level);
  const unitCost = toNullableNumber(payload.unit_cost);

  const notes =
    typeof payload.notes === 'string' && payload.notes.trim() !== ''
      ? payload.notes
      : null;

  return {
    ok: true,
    data: {
      item_name: itemName,
      category,
      unit_of_measure: unitOfMeasure,
      sku,
      quantity_available: quantityAvailable,
      reorder_level: reorderLevel,
      unit_cost: unitCost,
      notes,
    },
  };
};

const isValidId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    logWarn('Supabase admin client not available for inventory handler');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { id } = req.query;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid inventory item ID' });
  }

  const itemId = id;

  if (req.method === 'GET') {
    try {
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      if (itemError) {
        throw itemError;
      }

      if (!isInventoryItemRow(item)) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

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

      const updatePayload: InventoryUpdate = {
        ...parsed.data,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('inventory')
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
      const { data, error } = await supabase
        .from('inventory')
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
