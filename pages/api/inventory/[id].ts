import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: item, error: itemError } = await supabaseAdmin
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      if (itemError) throw itemError;

      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      return res.status(200).json({ item });
    } catch (error: any) {
      console.error('Error fetching inventory item:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const {
        item_name,
        category,
        sku,
        unit_of_measure,
        quantity_available,
        reorder_level,
        unit_cost,
        notes,
      } = req.body;

      if (!item_name || !category || !unit_of_measure) {
        return res.status(400).json({
          error: 'item_name, category, and unit_of_measure are required',
        });
      }

      const { data, error } = await supabaseAdmin
        .from('inventory')
        .update({
          item_name,
          category,
          sku: sku || null,
          unit_of_measure,
          quantity_available,
          reorder_level,
          unit_cost: unit_cost || null,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res
        .status(200)
        .json({ message: 'Inventory item deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
