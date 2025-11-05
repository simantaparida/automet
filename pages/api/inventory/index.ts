import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';

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
  // Authenticate user
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) return;

  const { user } = authResult;
  const supabase = createServerSupabaseClient<Database>({ req, res });

  if (req.method === 'GET') {
    try {
      const { low_stock } = req.query;

      // RLS policies automatically filter by user's org_id
      let query = supabase
        .from('inventory_items')
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
    // Only owners and coordinators can create inventory items
    if (!requireRole(user, ['owner', 'coordinator'], res)) return;

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

      // RLS policies automatically enforce org_id from authenticated user
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          org_id: user.org_id, // Use authenticated user's org_id
          item_name,
          category,
          sku: sku || null,
          unit_of_measure,
          quantity_available: quantity_available || 0,
          reorder_level: reorder_level || 0,
          unit_cost: unit_cost || null,
          notes: notes || null,
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
