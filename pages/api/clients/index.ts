import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';
import type { Database } from '@/types/database';

interface ClientRow {
  id: string;
  org_id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

type ClientInsert = Omit<ClientRow, 'id' | 'created_at' | 'updated_at'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNullableString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

const isValidEmail = (value: string | null): boolean =>
  value === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseClientPayload = (
  payload: unknown
):
  | { ok: true; data: Omit<ClientInsert, 'org_id'> }
  | { ok: false; message: string } => {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Invalid payload format.' };
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';

  if (!name) {
    return { ok: false, message: 'Name is required.' };
  }

  const contactEmail = toNullableString(payload.contact_email);
  if (!isValidEmail(contactEmail)) {
    return {
      ok: false,
      message: 'Please provide a valid email or leave it blank.',
    };
  }

  const contactPhone = toNullableString(payload.contact_phone);

  return {
    ok: true,
    data: {
      name,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      address: toNullableString(payload.address),
      notes: toNullableString(payload.notes),
    },
  };
};

const isClientRow = (value: unknown): value is ClientRow =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.org_id === 'string' &&
  typeof value.name === 'string' &&
  ('contact_email' in value
    ? typeof value.contact_email === 'string' || value.contact_email === null
    : true) &&
  ('contact_phone' in value
    ? typeof value.contact_phone === 'string' || value.contact_phone === null
    : true) &&
  ('address' in value
    ? typeof value.address === 'string' || value.address === null
    : true) &&
  ('notes' in value
    ? typeof value.notes === 'string' || value.notes === null
    : true);

const normalizeClientList = (data: unknown): ClientRow[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  const clients: ClientRow[] = [];
  for (const entry of data) {
    if (isClientRow(entry)) {
      clients.push(entry);
    }
  }
  return clients;
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
      // Use the authenticated Supabase client from withOnboardedAuth
      // This client has the session properly configured, so RLS policies will work
      const typedClient = supabase as unknown as SupabaseClient<Database>;
      const { data, error } = await typedClient
        .from('clients')
        .select(
          'id, org_id, name, contact_email, contact_phone, address, notes, created_at, updated_at'
        )
        .order('name', { ascending: true });

      if (error) {
        logError('Clients API fetch error:', error);
        // Log full error details for debugging
        console.error('Full RLS error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          user: {
            id: user.id,
            org_id: user.org_id,
            role: user.role,
          },
        });
        
        // Return the error details for debugging
        return res.status(500).json({
          error: 'Failed to fetch clients',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      return res.status(200).json(normalizeClientList(data));
    } catch (error) {
      logError('Clients API fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    if (!requireRole(user, ['owner', 'coordinator'], res)) {
      return;
    }

    try {
      const parsed = parseClientPayload(req.body);

      if (!parsed.ok) {
        return res.status(400).json({ error: parsed.message });
      }

      // Use the authenticated Supabase client from withOnboardedAuth
      const typedClient = supabase as unknown as SupabaseClient<Database>;
      const payload: ClientInsert = {
        ...parsed.data,
        org_id: user.org_id,
      };

      const response = await typedClient
        .from('clients')
        .insert(payload)
        .select(
          'id, org_id, name, contact_email, contact_phone, address, notes, created_at, updated_at'
        )
        .maybeSingle();

      if (response.error) {
        throw response.error;
      }

      const client = response.data;
      if (!isClientRow(client)) {
        return res.status(500).json({
          error: 'Client created but response format was unexpected',
        });
      }

      return res.status(201).json(client);
    } catch (error) {
      logError('Clients API create error:', error);
      return res.status(500).json({
        error: 'Failed to create client',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
