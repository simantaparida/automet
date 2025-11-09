import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withAuth, requireRole } from '@/lib/auth-middleware';
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
  address: string | null;
  gps_lat: string | null;
  gps_lng: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  client?: SiteRelation | null;
}

type SiteInsert = Omit<SiteRow, 'id' | 'created_at' | 'updated_at' | 'client'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNullableString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

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

  return {
    ok: true,
    data: {
      client_id: clientId,
      name,
      address: toNullableString(payload.address),
      gps_lat: toNullableString(payload.gps_lat),
      gps_lng: toNullableString(payload.gps_lng),
      notes: toNullableString(payload.notes),
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
    'created_at',
  ] as const;

  for (const field of requiredStrings) {
    if (typeof value[field] !== 'string') {
      return false;
    }
  }

  const optionalNullableStringFields = [
    'address',
    'gps_lat',
    'gps_lng',
    'notes',
    'updated_at',
  ] as const;
  for (const field of optionalNullableStringFields) {
    if (
      field in value &&
      value[field] !== null &&
      typeof value[field] !== 'string'
    ) {
      return false;
    }
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
  const authResult = await withAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user } = authResult;

  if (req.method === 'GET') {
    try {
      const filters = parseSiteFilters(req.query);
      const supabase = createServerSupabaseClient<Database>({
        req,
        res,
      }) as unknown as SupabaseClient<Database>;

      let query = supabase
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
            notes,
            created_at,
            updated_at,
            client:clients(id, name)
          `
        )
        .order('name', { ascending: true });

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json(normalizeSites(data));
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

      const typedClient = createServerSupabaseClient<Database>({
        req,
        res,
      }) as unknown as SupabaseClient<Database>;
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
            notes,
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
