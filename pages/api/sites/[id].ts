import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;
  const typedClient = supabase as unknown as SupabaseClient<Database>;

  const { id } = req.query;

  // Validate id parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const siteId = id;

  if (req.method === 'GET') {
    try {
      // Fetch site with related data - try with joins first
      let { data: site, error: siteError } = await typedClient
        .from('sites')
        .select(
          `
          id,
          name,
          address,
          gps_lat,
          gps_lng,
          metadata,
          created_at,
          client:clients!sites_client_id_fkey(id, name, contact_email, contact_phone)
        `
        )
        .eq('id', siteId)
        .single();

      // If join fails, try without join
      if (siteError) {
        console.error('Error fetching site with joins:', siteError);
        const simpleResult = await typedClient
          .from('sites')
          .select('id, name, address, gps_lat, gps_lng, metadata, created_at, client_id')
          .eq('id', siteId)
          .single();
        
        if (simpleResult.error) {
          throw simpleResult.error;
        }

        site = simpleResult.data as any;
        siteError = null;
      }

      if (siteError) throw siteError;

      if (!site) {
        return res.status(404).json({ error: 'Site not found' });
      }

      // Fetch related assets
      const { data: assets } = await typedClient
        .from('assets')
        .select('id, asset_type, model, serial_number')
        .eq('site_id', siteId)
        .order('asset_type');

      // Fetch related jobs
      const { data: jobs } = await typedClient
        .from('jobs')
        .select('id, title, status, priority, scheduled_at')
        .eq('site_id', siteId)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      return res.status(200).json({
        site: {
          ...(site as Record<string, unknown>),
          assets: assets || [],
          jobs: jobs || [],
        },
      });
    } catch (error: any) {
      logError('Error fetching site:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch site' });
    }
  }

  if (req.method === 'PATCH') {
    // Only owners and coordinators can update sites
    if (!requireRole(user, ['owner', 'coordinator'], res)) return;

    try {
      const { name, address, gps_lat, gps_lng, metadata } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const updatePayload: Database['public']['Tables']['sites']['Update'] = {
        name,
        address: address || null,
        gps_lat: gps_lat || null,
        gps_lng: gps_lng || null,
        metadata: metadata || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await typedClient
        .from('sites')
        .update(updatePayload)
        .eq('id', siteId)
        .select('id, name, address, gps_lat, gps_lng, metadata')
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error: any) {
      logError('Error updating site:', error);
      return res.status(500).json({ error: error.message || 'Failed to update site' });
    }
  }

  if (req.method === 'DELETE') {
    // Only owners and coordinators can delete sites
    if (!requireRole(user, ['owner', 'coordinator'], res)) return;

    try {
      // Check if site has associated assets
      const { data: assets } = await typedClient
        .from('assets')
        .select('id')
        .eq('site_id', siteId)
        .limit(1);

      if (assets && assets.length > 0) {
        return res.status(400).json({
          error:
            'Cannot delete site with associated assets. Please delete assets first.',
        });
      }

      // Check if site has associated jobs
      const { data: jobs } = await typedClient
        .from('jobs')
        .select('id')
        .eq('site_id', siteId)
        .limit(1);

      if (jobs && jobs.length > 0) {
        return res.status(400).json({
          error:
            'Cannot delete site with associated jobs. Please delete jobs first.',
        });
      }

      const { error } = await typedClient
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;

      return res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error: any) {
      logError('Error deleting site:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete site' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
