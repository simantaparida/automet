import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Inventory API Route
 * GET /api/inventory - List all inventory items
 * POST /api/inventory - Create a new inventory item
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { low_stock } = req.query;

      let query = supabaseAdmin
        .from('inventory')
        .select('*')
        .order('item_name', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching inventory:', error);
        return res.status(500).json({ error: error.message });
      }

      // Filter low stock items if requested
      let filteredData = data || [];
      if (low_stock === 'true' && filteredData.length > 0) {
        filteredData = filteredData.filter(item =>
          item.quantity_available <= (item.reorder_level || 0)
        );
      }

      return res.status(200).json(filteredData);
    } catch (error) {
      console.error('Inventory API error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        item_name,
        category,
        sku,
        unit_of_measure,
        quantity_available,
        reorder_level,
        unit_cost,
        notes
      } = req.body;

      if (!item_name || !category || !unit_of_measure) {
        return res.status(400).json({
          error: 'item_name, category, and unit_of_measure are required'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('inventory')
        .insert({
          org_id: '10000000-0000-0000-0000-000000000001', // Default org
          item_name,
          category,
          sku: sku || null,
          unit_of_measure,
          quantity_available: quantity_available || 0,
          reorder_level: reorder_level || 0,
          unit_cost: unit_cost || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating inventory item:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Create inventory error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
