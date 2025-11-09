import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withAuth, requireRole } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';

/**
 * Assets API Route (Protected)
 * GET /api/assets - List all assets (optionally filtered by site_id or client_id)
 * POST /api/assets - Create a new asset (requires owner or coordinator role)
 *
 * @security Requires authentication
 * @security RLS policies enforced - users can only see assets in their org
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate user
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) return;

  const { user } = authResult;
  const supabase = createServerSupabaseClient<Database>({
    req,
    res,
  }) as unknown as SupabaseClient<Database>;

  if (req.method === 'GET') {
    try {
      const { site_id, client_id } = req.query;
      const siteFilter =
        typeof site_id === 'string' && site_id.trim() !== '' ? site_id : undefined;
      const clientFilter =
        typeof client_id === 'string' && client_id.trim() !== ''
          ? client_id
          : undefined;

      // RLS policies automatically filter by user's org_id
      let query = supabase
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
          site:sites(id, name, client:clients(id, name))
        `
        )
        .order('asset_type', { ascending: true });

      if (siteFilter) {
        query = query.eq('site_id', siteFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assets:', error);
        return res.status(500).json({ error: error.message });
      }

      // Filter by client_id if provided (since we join through site)
      let filteredData = (data || []) as Array<{
        site?: { client?: { id?: string } };
        [key: string]: unknown;
      }>;
      if (clientFilter && filteredData.length > 0) {
        filteredData = filteredData.filter(
          (asset) => asset.site?.client?.id === clientFilter
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
    // Only owners and coordinators can create assets
    if (!requireRole(user, ['owner', 'coordinator'], res)) return;

    try {
      const {
        site_id,
        asset_type,
        model,
        serial_number,
        purchase_date,
        warranty_expiry,
        notes,
      } = req.body;

      if (
        typeof site_id !== 'string' ||
        typeof asset_type !== 'string' ||
        typeof model !== 'string'
      ) {
        return res
          .status(400)
          .json({ error: 'site_id, asset_type, and model are required' });
      }

      // RLS policies automatically enforce org_id from authenticated user
      const payload: Database['public']['Tables']['assets']['Insert'] = {
        org_id: user.org_id,
        site_id,
        asset_type,
        model,
        serial_number: serial_number || null,
        purchase_date: purchase_date || null,
        warranty_expiry: warranty_expiry || null,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('assets')
        .insert(payload)
        .select(
          `
          id,
          asset_type,
          model,
          serial_number,
          purchase_date,
          warranty_expiry,
          notes,
          site_id
        `
        )
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
