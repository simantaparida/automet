import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';
import type { Database } from '@/types/database';

interface SiteRelation {
  id: string;
  name: string | null;
}

interface SiteRow {
  id: string;
  org_id: string;
  client_id: string;
  name: string;
  address: string;
  gps_lat: string | null;
  gps_lng: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
  client?: SiteRelation | null;
}

type SiteInsert = Omit<SiteRow, 'id' | 'created_at' | 'updated_at' | 'client'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

const parseSiteFilters = (
  query: NextApiRequest['query']
): { clientId?: string } => {
  const clientId = parseString(query.client_id);
  return { clientId };
};

const parseSitePayload = (
  payload: unknown
):
  | { ok: true; data: Omit<SiteInsert, 'org_id'> }
  | { ok: false; message: string } => {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Invalid payload format.' };
  }

  const clientId = parseString(payload.client_id);
  const name = parseString(payload.name);

  if (!clientId || !name) {
    return {
      ok: false,
      message: 'client_id and name are required.',
    };
  }

  const address = parseString(payload.address);
  if (!address) {
    return {
      ok: false,
      message: 'address is required.',
    };
  }

  // Parse GPS coordinates as strings (NUMERIC type in Postgres is returned as string)
  const gpsLat =
    typeof payload.gps_lat === 'number'
      ? payload.gps_lat.toString()
      : typeof payload.gps_lat === 'string' && payload.gps_lat.trim() !== ''
      ? payload.gps_lat.trim()
      : null;
  const gpsLng =
    typeof payload.gps_lng === 'number'
      ? payload.gps_lng.toString()
      : typeof payload.gps_lng === 'string' && payload.gps_lng.trim() !== ''
      ? payload.gps_lng.trim()
      : null;

  // Parse metadata if provided
  let metadata: Record<string, any> | null = null;
  if (payload.metadata && typeof payload.metadata === 'object') {
    metadata = payload.metadata as Record<string, any>;
  }

  return {
    ok: true,
    data: {
      client_id: clientId,
      name,
      address,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      metadata,
    },
  };
};

const isSiteRelation = (value: unknown): value is SiteRelation =>
  isRecord(value) && typeof value.id === 'string' && 'name' in value;

const isSiteRow = (value: unknown): value is SiteRow => {
  if (!isRecord(value)) {
    return false;
  }

  const requiredStrings = [
    'id',
    'org_id',
    'client_id',
    'name',
    'address',
    'created_at',
  ] as const;

  for (const field of requiredStrings) {
    if (typeof value[field] !== 'string') {
      return false;
    }
  }

  // gps_lat and gps_lng are numeric (can be null)
  if (
    'gps_lat' in value &&
    value.gps_lat !== null &&
    typeof value.gps_lat !== 'number' &&
    typeof value.gps_lat !== 'string'
  ) {
    return false;
  }
  if (
    'gps_lng' in value &&
    value.gps_lng !== null &&
    typeof value.gps_lng !== 'number' &&
    typeof value.gps_lng !== 'string'
  ) {
    return false;
  }

  // metadata is jsonb (can be null or object)
  if (
    'metadata' in value &&
    value.metadata !== null &&
    typeof value.metadata !== 'object'
    ) {
      return false;
    }

  // updated_at is optional timestamp
  if (
    'updated_at' in value &&
    value.updated_at !== null &&
    typeof value.updated_at !== 'string'
  ) {
    return false;
  }

  if (
    'client' in value &&
    value.client !== undefined &&
    value.client !== null &&
    !isSiteRelation(value.client)
  ) {
    return false;
  }

  return true;
};

const normalizeSites = (data: unknown): SiteRow[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  const sites: SiteRow[] = [];
  for (const entry of data) {
    if (isSiteRow(entry)) {
      sites.push(entry);
    }
  }

  return sites;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase } = authResult;

  if (req.method === 'GET') {
    try {
      const filters = parseSiteFilters(req.query);
      const typedClient = supabase as unknown as SupabaseClient<Database>;

      // Fetch sites with client join
      // RLS policies should now work correctly since permissions are granted
      let query = typedClient
        .from('sites')
        .select(
          `
            id,
            org_id,
            client_id,
            name,
            address,
            gps_lat,
            gps_lng,
            metadata,
            created_at,
            updated_at,
            client:clients!sites_client_id_fkey(id, name)
          `
        )
        .order('name', { ascending: true });

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      const { data, error } = await query;

      if (error) {
        logError('Sites API fetch error:', error);
        // If join fails, try without join
        console.log('Retrying without client join...');
        let simpleQuery = typedClient
          .from('sites')
          .select('id, org_id, client_id, name, address, gps_lat, gps_lng, metadata, created_at, updated_at')
          .order('name', { ascending: true });
        
        if (filters.clientId) {
          simpleQuery = simpleQuery.eq('client_id', filters.clientId);
      }

        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) {
          return res.status(500).json({
            error: 'Failed to fetch sites',
            message: simpleError.message,
            code: simpleError.code,
            details: simpleError.details,
            hint: simpleError.hint,
            originalError: error.message,
          });
        }
        
        // Return sites without client data - frontend can fetch clients separately
        return res.status(200).json(simpleData || []);
      }

      // Check if we got data but it's empty (might be RLS blocking the join)
      if (!data || data.length === 0) {
        console.log('No data returned with joins, trying without joins...');
        let simpleQuery = typedClient
          .from('sites')
          .select('id, org_id, client_id, name, address, gps_lat, gps_lng, metadata, created_at, updated_at')
          .order('name', { ascending: true });
        
        if (filters.clientId) {
          simpleQuery = simpleQuery.eq('client_id', filters.clientId);
        }
        
        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) {
          return res.status(500).json({
            error: 'Failed to fetch sites',
            message: simpleError.message,
            code: simpleError.code,
          });
        }
        
        // Return sites without nested data
        return res.status(200).json(simpleData || []);
      }

      return res.status(200).json(normalizeSites(data || []));
    } catch (error) {
      logError('Sites API fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch sites',
      });
    }
  }

  if (req.method === 'POST') {
    if (!requireRole(user, ['owner', 'coordinator'], res)) {
      return;
    }

    try {
      const parsed = parseSitePayload(req.body);
      if (!parsed.ok) {
        return res.status(400).json({ error: parsed.message });
      }

      const typedClient = supabase as unknown as SupabaseClient<Database>;
      const payload: SiteInsert = {
        ...parsed.data,
        org_id: user.org_id,
      };

      const response = await typedClient
        .from('sites')
        .insert(payload)
        .select(
          `
            id,
            org_id,
            client_id,
            name,
            address,
            gps_lat,
            gps_lng,
            metadata,
            created_at,
            updated_at
          `
        )
        .maybeSingle();

      if (response.error) {
        throw response.error;
      }

      const site = response.data;
      if (!isSiteRow(site)) {
        return res.status(500).json({
          error: 'Site created but response format was unexpected',
        });
      }

      return res.status(201).json(site);
    } catch (error) {
      logError('Sites API create error:', error);
      return res.status(500).json({
        error: 'Failed to create site',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
