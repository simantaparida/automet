import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';

/**
 * Sites API Route (Protected)
 * GET /api/sites - List all sites (optionally filtered by client_id)
 * POST /api/sites - Create a new site (requires owner or coordinator role)
 *
 * @security Requires authentication
 * @security RLS policies enforced - users can only see sites in their org
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
      const { client_id } = req.query;

      // RLS policies automatically filter by user's org_id
      let query = supabase
        .from('sites')
        .select(`
          id,
          name,
          address,
          client_id,
          gps_lat,
          gps_lng,
          notes,
          client:clients(id, name)
        `)
        .order('name', { ascending: true });

      if (client_id) {
        query = query.eq('client_id', client_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sites:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Sites API error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    // Only owners and coordinators can create sites
    if (!requireRole(user, ['owner', 'coordinator'], res)) return;

    try {
      const { client_id, name, address, gps_lat, gps_lng, notes } = req.body;

      if (!client_id || !name) {
        return res.status(400).json({ error: 'client_id and name are required' });
      }

      // RLS policies automatically enforce org_id from authenticated user
      const { data, error } = await supabase
        .from('sites')
        .insert({
          org_id: user.org_id, // Use authenticated user's org_id
          client_id,
          name,
          address: address || null,
          gps_lat: gps_lat || null,
          gps_lng: gps_lng || null,
          notes: notes || null,
        })
        .select(`
          id,
          name,
          address,
          client_id,
          gps_lat,
          gps_lng,
          notes
        `)
        .single();

      if (error) {
        console.error('Error creating site:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Create site error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
