import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Sites API Route
 * GET /api/sites - List all sites (optionally filtered by client_id)
 * POST /api/sites - Create a new site
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { client_id } = req.query;

      let query = supabaseAdmin
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
    try {
      const { client_id, name, address, gps_lat, gps_lng, notes } = req.body;

      if (!client_id || !name) {
        return res.status(400).json({ error: 'client_id and name are required' });
      }

      const { data, error } = await supabaseAdmin
        .from('sites')
        .insert({
          org_id: '10000000-0000-0000-0000-000000000001', // Default org
          client_id,
          name,
          address: address || null,
          gps_lat: gps_lat || null,
          gps_lng: gps_lng || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
