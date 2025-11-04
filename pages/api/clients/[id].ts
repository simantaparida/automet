import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Fetch client with related data
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id, name, contact_email, contact_phone, address, notes, created_at')
        .eq('id', id)
        .single();

      if (clientError) throw clientError;

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      // Fetch related sites
      const { data: sites } = await supabaseAdmin
        .from('sites')
        .select('id, name, address, gps_lat, gps_lng')
        .eq('client_id', id)
        .order('name');

      // Fetch related jobs
      const { data: jobs } = await supabaseAdmin
        .from('jobs')
        .select('id, title, status, priority, scheduled_at')
        .eq('client_id', id)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      return res.status(200).json({
        client: {
          ...client,
          sites: sites || [],
          jobs: jobs || [],
        },
      });
    } catch (error: any) {
      console.error('Error fetching client:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { name, contact_email, contact_phone, address, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const { data, error } = await supabaseAdmin
        .from('clients')
        .update({
          name,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          address: address || null,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id, name, contact_email, contact_phone, address, notes')
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error updating client:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if client has associated sites
      const { data: sites } = await supabaseAdmin
        .from('sites')
        .select('id')
        .eq('client_id', id)
        .limit(1);

      if (sites && sites.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete client with associated sites. Please delete sites first.',
        });
      }

      // Check if client has associated jobs
      const { data: jobs } = await supabaseAdmin
        .from('jobs')
        .select('id')
        .eq('client_id', id)
        .limit(1);

      if (jobs && jobs.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete client with associated jobs. Please delete jobs first.',
        });
      }

      const { error } = await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
