import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';
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
  // Authenticate user (requires completed onboarding)
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) return;

  const { user, supabase } = authResult;
  const typedClient = supabase as unknown as SupabaseClient<Database>;

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
      // Use the authenticated Supabase client from withOnboardedAuth
      // Try simpler join syntax - PostgREST nested joins can be tricky with RLS
      let query = typedClient
        .from('assets')
        .select(
          `
          id,
          asset_type,
          model,
          serial_number,
          install_date,
          metadata,
          site_id,
          site:sites(id, name, client:clients(id, name))
        `
        )
        .order('asset_type', { ascending: true });

      if (siteFilter) {
        query = query.eq('site_id', siteFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assets with joins:', error);
        // Log the full error for debugging
        console.error('Full error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        
        // If nested join fails, try without the join
        console.log('Retrying without nested join...');
        let simpleQuery = typedClient
          .from('assets')
          .select('id, asset_type, model, serial_number, install_date, metadata, site_id')
          .order('asset_type', { ascending: true });
        
        if (siteFilter) {
          simpleQuery = simpleQuery.eq('site_id', siteFilter);
        }
        
        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) {
          return res.status(500).json({ 
            error: simpleError.message,
            code: simpleError.code,
            details: simpleError.details,
            hint: simpleError.hint,
            originalError: error.message,
          });
        }
        
        // Return assets without nested data - frontend can fetch sites separately
        return res.status(200).json(simpleData || []);
      }

      // Check if we got data but it's empty (might be RLS blocking the join)
      if (!data || data.length === 0) {
        console.log('No data returned with joins, trying without joins...');
        // Try fetching without joins to see if assets exist
        let simpleQuery = typedClient
          .from('assets')
          .select('id, asset_type, model, serial_number, install_date, metadata, site_id')
          .order('asset_type', { ascending: true });
        
        if (siteFilter) {
          simpleQuery = simpleQuery.eq('site_id', siteFilter);
        }
        
        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) {
          return res.status(500).json({ 
            error: simpleError.message,
            code: simpleError.code,
            details: simpleError.details,
            hint: simpleError.hint,
          });
        }
        
        // Return assets without nested data
        return res.status(200).json(simpleData || []);
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

      return res.status(200).json(filteredData || []);
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
        install_date,
        metadata,
      } = req.body;

      if (
        typeof site_id !== 'string' ||
        typeof asset_type !== 'string'
      ) {
        return res
          .status(400)
          .json({ error: 'site_id and asset_type are required' });
      }

      // RLS policies automatically enforce org_id from authenticated user
      const payload: Database['public']['Tables']['assets']['Insert'] = {
        org_id: user.org_id,
        site_id,
        asset_type,
        model: model || null,
        serial_number: serial_number || null,
        install_date: install_date || null,
        metadata: metadata || null,
      };

      const { data, error } = await typedClient
        .from('assets')
        .insert(payload)
        .select(
          `
          id,
          asset_type,
          model,
          serial_number,
          install_date,
          metadata,
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
