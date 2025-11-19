import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { withOnboardedAuth } from '@/lib/auth-middleware';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * GET /api/test-users/diagnose
 * Comprehensive diagnostics for data visibility issues
 * 
 * ⚠️ This should only be used in development/testing environments!
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Diagnostics are not allowed in production',
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate the request
  const authResult = await withOnboardedAuth(req, res);
  if (!authResult.authenticated) {
    return; // Response already sent by middleware
  }

  const { user, supabase } = authResult;
  const orgId = user.org_id;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Supabase Admin client not available',
    });
  }

  try {
    const diagnostics: Record<string, any> = {
      user: {
        id: user.id,
        email: user.email,
        org_id: orgId,
        role: user.role,
        activeRole: user.activeRole,
      },
      checks: {},
    };

    // 1. Check organization exists
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, slug')
      .eq('id', orgId)
      .maybeSingle();

    diagnostics.checks.organization = {
      exists: !!org,
      error: orgError?.message,
      data: org,
    };

    // 2. Check data exists in database (using admin client - bypasses RLS)
    const [clientsAdmin, sitesAdmin, assetsAdmin, jobsAdmin, inventoryAdmin] = await Promise.all([
      supabaseAdmin.from('clients').select('id, name, org_id').eq('org_id', orgId),
      supabaseAdmin.from('sites').select('id, name, org_id').eq('org_id', orgId),
      supabaseAdmin.from('assets').select('id, asset_type, org_id').eq('org_id', orgId),
      supabaseAdmin.from('jobs').select('id, title, org_id, status').eq('org_id', orgId),
      supabaseAdmin.from('inventory_items').select('id, name, org_id').eq('org_id', orgId),
    ]);

    diagnostics.checks.dataInDatabase = {
      clients: {
        count: clientsAdmin.data?.length || 0,
        error: clientsAdmin.error?.message,
        sample: clientsAdmin.data?.slice(0, 3).map(c => ({ id: c.id, name: c.name })),
      },
      sites: {
        count: sitesAdmin.data?.length || 0,
        error: sitesAdmin.error?.message,
      },
      assets: {
        count: assetsAdmin.data?.length || 0,
        error: assetsAdmin.error?.message,
      },
      jobs: {
        count: jobsAdmin.data?.length || 0,
        error: jobsAdmin.error?.message,
        byStatus: jobsAdmin.data?.reduce((acc, job) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      inventory: {
        count: inventoryAdmin.data?.length || 0,
        error: inventoryAdmin.error?.message,
      },
    };

    // 3. Check what the authenticated API returns (respects RLS)
    try {
      const supabaseClient = supabase as unknown as SupabaseClient<Database>;

      // Get session to verify authentication
      const { data: session, error: sessionError } = await supabaseClient.auth.getSession();
      diagnostics.checks.session = {
        exists: !!session?.session,
        userId: session?.session?.user?.id,
        userEmail: session?.session?.user?.email,
        expiresAt: session?.session?.expires_at,
        accessToken: session?.session?.access_token ? 'present' : 'missing',
        error: sessionError?.message,
        matchesUserProfile: session?.session?.user?.id === user.id,
      };

      // Try to fetch clients using authenticated client (respects RLS)
      const { data: clientsRLS, error: clientsRLSError } = await supabaseClient
        .from('clients')
        .select('id, name, org_id')
        .order('name', { ascending: true });

      diagnostics.checks.dataViaRLS = {
        clients: {
          count: clientsRLS?.length || 0,
          error: clientsRLSError?.message,
          errorCode: clientsRLSError?.code,
          errorDetails: clientsRLSError?.details,
          hint: clientsRLSError?.hint,
          fullError: clientsRLSError ? JSON.stringify(clientsRLSError, null, 2) : null,
          sample: clientsRLS?.slice(0, 3).map(c => ({ id: c.id, name: c.name })),
        },
      };

      // Try to fetch jobs
      const { data: jobsRLS, error: jobsRLSError } = await supabaseClient
        .from('jobs')
        .select('id, title, org_id, status')
        .limit(10);

      diagnostics.checks.dataViaRLS.jobs = {
        count: jobsRLS?.length || 0,
        error: jobsRLSError?.message,
        errorCode: jobsRLSError?.code,
      };
    } catch (apiError: any) {
      diagnostics.checks.dataViaRLS = {
        error: apiError.message || 'Failed to check RLS data',
      };
    }

    // 4. Check user's email_confirmed status and verify org_id matches
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, org_id, role, email_confirmed')
      .eq('id', user.id)
      .maybeSingle();

    diagnostics.checks.userProfile = {
      emailConfirmed: userData?.email_confirmed || false,
      role: userData?.role,
      orgId: userData?.org_id,
      error: userError?.message,
      note: 'SELECT policies don\'t require email_confirmed, but ALL policies do',
    };

    // 5. Test RLS policy directly by checking if auth.uid() would match
    if (diagnostics.checks.session?.userId) {
      const { data: rlsTestUser, error: rlsTestError } = await supabaseAdmin
        .from('users')
        .select('id, org_id')
        .eq('id', diagnostics.checks.session.userId)
        .maybeSingle();

      diagnostics.checks.rlsTest = {
        userIdFromSession: diagnostics.checks.session.userId,
        userExists: !!rlsTestUser,
        orgIdFromDB: rlsTestUser?.org_id,
        orgIdMatches: rlsTestUser?.org_id === orgId,
        error: rlsTestError?.message,
        note: 'If orgIdMatches is false, RLS will fail because the session user\'s org_id doesn\'t match the data\'s org_id',
      };
    }

    // 5. Summary and recommendations
    const hasDataInDB = (diagnostics.checks.dataInDatabase.clients.count > 0);
    const hasDataViaRLS = (diagnostics.checks.dataViaRLS?.clients?.count > 0);
    const hasRLSError = !!diagnostics.checks.dataViaRLS?.clients?.error;

    diagnostics.summary = {
      hasDataInDatabase: hasDataInDB,
      hasDataViaRLS: hasDataViaRLS,
      hasRLSError: hasRLSError,
      recommendation: hasDataInDB && !hasDataViaRLS
        ? 'Data exists in database but RLS is blocking access. Check RLS policies and user session.'
        : !hasDataInDB
        ? 'No data found in database for this organization. Run seed data endpoint.'
        : hasRLSError
        ? `RLS error: ${diagnostics.checks.dataViaRLS?.clients?.error}`
        : 'Everything looks good!',
    };

    return res.status(200).json(diagnostics);
  } catch (error: any) {
    console.error('Error running diagnostics:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to run diagnostics',
    });
  }
}

