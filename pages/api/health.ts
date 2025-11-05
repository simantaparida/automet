import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

type HealthResponse = {
  status: 'ok' | 'error';
  timestamp: string;
  database?: 'connected' | 'error';
  version?: string;
  error?: string;
};

/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Returns service health status and database connectivity
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Method not allowed',
    });
  }

  try {
    // Test database connection using admin client (bypasses RLS)
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: 'Admin client not available. Check SUPABASE_SERVICE_ROLE_KEY.',
      });
    }

    const { error } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
