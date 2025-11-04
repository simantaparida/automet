import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Clients API Route
 * GET /api/clients - List all clients
 * POST /api/clients - Create a new client
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('id, name, contact_email, contact_phone, address, notes')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Clients API error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, contact_email, contact_phone, address, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const { data, error } = await supabaseAdmin
        .from('clients')
        .insert({
          org_id: '10000000-0000-0000-0000-000000000001', // Default org for now
          name,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          address: address || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id, name, contact_email, contact_phone, address, notes')
        .single();

      if (error) {
        console.error('Error creating client:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Create client error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
