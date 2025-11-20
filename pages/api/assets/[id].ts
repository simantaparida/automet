import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';

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

  // Validate id parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid asset ID' });
  }

  const assetId = id;

  if (req.method === 'GET') {
    try {
      // Fetch asset with related data - try with joins first
      let { data: asset, error: assetError } = await typedClient
        .from('assets')
        .select(
          `
          id,
          asset_type,
          model,
          serial_number,
          install_date,
          metadata,
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

      // If join fails, try without join
      if (assetError) {
        console.error('Error fetching asset with joins:', assetError);
        const simpleResult = await typedClient
          .from('assets')
          .select(
            'id, asset_type, model, serial_number, install_date, metadata, created_at, site_id'
          )
          .eq('id', assetId)
          .single();

        if (simpleResult.error) {
          throw simpleResult.error;
        }

        asset = simpleResult.data as any;
        assetError = null;
      }

      if (assetError) throw assetError;

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // Fetch related jobs
      const { data: jobs } = await typedClient
        .from('jobs')
        .select('id, title, status, priority, scheduled_at')
        .eq('asset_id', assetId)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      return res.status(200).json({
        asset: {
          ...(asset as any),
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
    // Only owners and coordinators can update assets
    if (!requireRole(authResult.user, ['owner', 'coordinator'], res)) return;

    try {
      const { asset_type, model, serial_number, install_date, metadata } =
        req.body;

      if (!asset_type) {
        return res.status(400).json({ error: 'asset_type is required' });
      }

      const updatePayload: Database['public']['Tables']['assets']['Update'] = {
        asset_type,
        model: model || null,
        serial_number: serial_number || null,
        install_date: install_date || null,
        metadata: metadata || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await typedClient
        .from('assets')
        .update(updatePayload)
        .eq('id', assetId)
        .select('id, asset_type, model, serial_number, install_date, metadata')
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
    // Only owners and coordinators can delete assets
    if (!requireRole(authResult.user, ['owner', 'coordinator'], res)) return;

    try {
      // Check if asset has associated jobs
      const { data: jobs } = await typedClient
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

      const { error } = await typedClient
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      return res.status(200).json({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Error deleting asset:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
