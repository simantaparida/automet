import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { Database } from '@/types/database';

interface DiagnosticCount {
  count: number;
  sample?: unknown[];
  error?: string;
}

interface Comparison {
  inDB: number;
  viaRLS: number;
  match: boolean;
}

interface DiagnosticResults {
  user: {
    id: string;
    email: string;
    org_id: string;
    role: string;
    activeRole?: string;
  };
  dataInDatabase: Record<string, DiagnosticCount>;
  dataViaRLS: Record<string, DiagnosticCount>;
  comparison: Record<string, Comparison>;
  diagnosis?: {
    hasDataInDB: boolean;
    canAccessViaRLS: boolean;
    rlsIssue: boolean;
  };
}

/**
 * Diagnostic endpoint to check data visibility issues
 * Compares what data exists in DB vs what user can see via RLS
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return;
  }

  const { user, supabase: untypedSupabase } = authResult;
  const supabase = untypedSupabase as unknown as SupabaseClient<Database>;
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const results: DiagnosticResults = {
      user: {
        id: user.id,
        email: user.email,
        org_id: user.org_id,
        role: user.role,
        activeRole: user.activeRole,
      },
      dataInDatabase: {},
      dataViaRLS: {},
      comparison: {},
    };

    // Check what exists in database (admin access)
    if (supabaseAdmin) {
      const [clients, sites, assets, jobs, inventory] = await Promise.all([
        supabaseAdmin
          .from('clients')
          .select('id, name')
          .eq('org_id', user.org_id),
        supabaseAdmin
          .from('sites')
          .select('id, name')
          .eq('org_id', user.org_id),
        supabaseAdmin
          .from('assets')
          .select('id, asset_type')
          .eq('org_id', user.org_id),
        supabaseAdmin
          .from('jobs')
          .select('id, title, status')
          .eq('org_id', user.org_id),
        supabaseAdmin
          .from('inventory_items')
          .select('id, name')
          .eq('org_id', user.org_id),
      ]);

      results.dataInDatabase = {
        clients: {
          count: clients.data?.length || 0,
          sample: clients.data?.slice(0, 2),
        },
        sites: {
          count: sites.data?.length || 0,
          sample: sites.data?.slice(0, 2),
        },
        assets: {
          count: assets.data?.length || 0,
          sample: assets.data?.slice(0, 2),
        },
        jobs: { count: jobs.data?.length || 0, sample: jobs.data?.slice(0, 2) },
        inventory: {
          count: inventory.data?.length || 0,
          sample: inventory.data?.slice(0, 2),
        },
      };
    }

    // Check what user can see via RLS (authenticated access)
    const [clientsRLS, sitesRLS, assetsRLS, jobsRLS, inventoryRLS] =
      await Promise.all([
        supabase.from('clients').select('id, name'),
        supabase.from('sites').select('id, name'),
        supabase.from('assets').select('id, asset_type'),
        supabase.from('jobs').select('id, title, status'),
        supabase.from('inventory_items').select('id, name'),
      ]);

    results.dataViaRLS = {
      clients: {
        count: clientsRLS.data?.length || 0,
        sample: clientsRLS.data?.slice(0, 2),
        error: clientsRLS.error?.message,
      },
      sites: {
        count: sitesRLS.data?.length || 0,
        sample: sitesRLS.data?.slice(0, 2),
        error: sitesRLS.error?.message,
      },
      assets: {
        count: assetsRLS.data?.length || 0,
        sample: assetsRLS.data?.slice(0, 2),
        error: assetsRLS.error?.message,
      },
      jobs: {
        count: jobsRLS.data?.length || 0,
        sample: jobsRLS.data?.slice(0, 2),
        error: jobsRLS.error?.message,
      },
      inventory: {
        count: inventoryRLS.data?.length || 0,
        sample: inventoryRLS.data?.slice(0, 2),
        error: inventoryRLS.error?.message,
      },
    };

    // Compare
    results.comparison = {
      clients: {
        inDB: results.dataInDatabase.clients?.count || 0,
        viaRLS: results.dataViaRLS.clients?.count || 0,
        match:
          results.dataInDatabase.clients?.count ===
          results.dataViaRLS.clients?.count,
      },
      sites: {
        inDB: results.dataInDatabase.sites?.count || 0,
        viaRLS: results.dataViaRLS.sites?.count || 0,
        match:
          results.dataInDatabase.sites?.count ===
          results.dataViaRLS.sites?.count,
      },
      assets: {
        inDB: results.dataInDatabase.assets?.count || 0,
        viaRLS: results.dataViaRLS.assets?.count || 0,
        match:
          results.dataInDatabase.assets?.count ===
          results.dataViaRLS.assets?.count,
      },
      jobs: {
        inDB: results.dataInDatabase.jobs?.count || 0,
        viaRLS: results.dataViaRLS.jobs?.count || 0,
        match:
          results.dataInDatabase.jobs?.count === results.dataViaRLS.jobs?.count,
      },
      inventory: {
        inDB: results.dataInDatabase.inventory?.count || 0,
        viaRLS: results.dataViaRLS.inventory?.count || 0,
        match:
          results.dataInDatabase.inventory?.count ===
          results.dataViaRLS.inventory?.count,
      },
    };

    results.diagnosis = {
      hasDataInDB: Object.values(results.dataInDatabase).some(
        (d) => d.count > 0
      ),
      canAccessViaRLS: Object.values(results.dataViaRLS).some(
        (d) => d.count > 0
      ),
      rlsIssue: Object.values(results.comparison).some(
        (c) => !c.match && c.inDB > 0
      ),
    };

    return res.status(200).json(results);
  } catch (error) {
    console.error('Diagnostic error:', error);
    return res.status(500).json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
