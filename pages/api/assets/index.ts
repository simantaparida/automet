import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Assets API Route
 * GET /api/assets - List all assets (optionally filtered by site_id or client_id)
 * POST /api/assets - Create a new asset
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { site_id, client_id } = req.query;

      let query = supabaseAdmin
        .from('assets')
        .select(`
          id,
          asset_type,
          model,
          serial_number,
          purchase_date,
          warranty_expiry,
          notes,
          site:sites(id, name, client:clients(id, name))
        `)
        .order('asset_type', { ascending: true });

      if (site_id) {
        query = query.eq('site_id', site_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assets:', error);
        return res.status(500).json({ error: error.message });
      }

      // Filter by client_id if provided (since we join through site)
      let filteredData = data || [];
      if (client_id && filteredData.length > 0) {
        filteredData = filteredData.filter(asset =>
          asset.site?.client?.id === client_id
        );
      }

      return res.status(200).json(filteredData);
    } catch (error) {
      console.error('Assets API error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { site_id, asset_type, model, serial_number, purchase_date, warranty_expiry, notes } = req.body;

      if (!site_id || !asset_type || !model) {
        return res.status(400).json({ error: 'site_id, asset_type, and model are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('assets')
        .insert({
          org_id: '10000000-0000-0000-0000-000000000001', // Default org
          site_id,
          asset_type,
          model,
          serial_number: serial_number || null,
          purchase_date: purchase_date || null,
          warranty_expiry: warranty_expiry || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          id,
          asset_type,
          model,
          serial_number,
          purchase_date,
          warranty_expiry,
          notes,
          site_id
        `)
        .single();

      if (error) {
        console.error('Error creating asset:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Create asset error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
