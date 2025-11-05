import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';

/**
 * Clients API Route (Protected)
 * GET /api/clients - List all clients in user's organization
 * POST /api/clients - Create a new client (requires owner or coordinator role)
 *
 * @security Requires authentication
 * @security RLS policies enforced - users can only see clients in their org
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
      // RLS policies automatically filter by user's org_id
      const { data, error } = await supabase
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
    // Only owners and coordinators can create clients
    if (!requireRole(user, ['owner', 'coordinator'], res)) return;

    try {
      const { name, contact_email, contact_phone, address, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // RLS policies automatically enforce org_id from authenticated user
      const { data, error } = await supabase
        .from('clients')
        .insert({
          org_id: user.org_id, // Use authenticated user's org_id
          name,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          address: address || null,
          notes: notes || null,
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
