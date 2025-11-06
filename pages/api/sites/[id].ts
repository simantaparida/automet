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
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const siteId = id as string;

  if (req.method === 'GET') {
    try {
      // Fetch site with related data
      const { data: site, error: siteError } = await supabaseAdmin
        .from('sites')
        .select(
          `
          id,
          name,
          address,
          gps_lat,
          gps_lng,
          notes,
          created_at,
          client:clients(id, name, contact_email, contact_phone)
        `
        )
        .eq('id', siteId)
        .single();

      if (siteError) throw siteError;

      if (!site) {
        return res.status(404).json({ error: 'Site not found' });
      }

      // Fetch related assets
      const { data: assets } = await supabaseAdmin
        .from('assets')
        .select('id, asset_type, model, serial_number')
        .eq('site_id', id)
        .order('asset_type');

      // Fetch related jobs
      const { data: jobs } = await supabaseAdmin
        .from('jobs')
        .select('id, title, status, priority, scheduled_at')
        .eq('site_id', id)
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
      console.error('Error fetching site:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { name, address, gps_lat, gps_lng, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const { data, error } = await supabaseAdmin
        .from('sites')
        // @ts-ignore - Supabase type inference issue with update
        .update({
          name,
          address: address || null,
          gps_lat: gps_lat || null,
          gps_lng: gps_lng || null,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', siteId)
        .select('id, name, address, gps_lat, gps_lng, notes')
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error updating site:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if site has associated assets
      const { data: assets } = await supabaseAdmin
        .from('assets')
        .select('id')
        .eq('site_id', id)
        .limit(1);

      if (assets && assets.length > 0) {
        return res.status(400).json({
          error:
            'Cannot delete site with associated assets. Please delete assets first.',
        });
      }

      // Check if site has associated jobs
      const { data: jobs } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('site_id', id)
        .limit(1);

      if (jobs && jobs.length > 0) {
        return res.status(400).json({
          error:
            'Cannot delete site with associated jobs. Please delete jobs first.',
        });
      }

      const { error } = await supabaseAdmin.from('sites').delete().eq('id', siteId);

      if (error) throw error;

      return res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting site:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
