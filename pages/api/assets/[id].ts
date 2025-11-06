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

  // Validate id parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid asset ID' });
  }

  const assetId = id;

  if (req.method === 'GET') {
    try {
      // Fetch asset with related data
      const { data: asset, error: assetError } = await supabaseAdmin
        .from('assets')
        .select(
          `
          id,
          asset_type,
          model,
          serial_number,
          purchase_date,
          warranty_expiry,
          notes,
          created_at,
          site:sites(
            id,
            name,
            address,
            client:clients(id, name, contact_email, contact_phone)
          )
        `
        )
        .eq('id', assetId)
        .single();

      if (assetError) throw assetError;

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // Fetch related jobs
      const { data: jobs } = await supabaseAdmin
        .from('jobs')
        .select('id, title, status, priority, scheduled_at')
        .eq('asset_id', assetId)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      return res.status(200).json({
        asset: {
          ...(asset as Record<string, unknown>),
          jobs: jobs || [],
        },
      });
    } catch (error) {
      console.error('Error fetching asset:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const {
        asset_type,
        model,
        serial_number,
        purchase_date,
        warranty_expiry,
        notes,
      } = req.body;

      if (!asset_type || !model) {
        return res
          .status(400)
          .json({ error: 'asset_type and model are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('assets')
        // @ts-expect-error - Supabase type inference issue with update
        .update({
          asset_type,
          model,
          serial_number: serial_number || null,
          purchase_date: purchase_date || null,
          warranty_expiry: warranty_expiry || null,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assetId)
        .select(
          'id, asset_type, model, serial_number, purchase_date, warranty_expiry, notes'
        )
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error updating asset:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if asset has associated jobs
      const { data: jobs } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('asset_id', assetId)
        .limit(1);

      if (jobs && jobs.length > 0) {
        return res.status(400).json({
          error:
            'Cannot delete asset with associated jobs. Please delete jobs first.',
        });
      }

      const { error } = await supabaseAdmin
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      return res.status(200).json({ message: 'Asset deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
