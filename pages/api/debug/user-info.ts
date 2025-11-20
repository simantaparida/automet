import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerSupabaseClient<Database>({ req, res });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        return res.status(401).json({ error: 'No session', sessionError });
    }

    // Get user profile directly
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    // Test RLS visibility for other tables
    const { count: jobsCount, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

    // Check what get_auth_org_id() returns (if we can call it via rpc)
    let authOrgId = 'unknown';
    try {
        const { data, error } = await supabase.rpc('get_auth_org_id');
        if (error) authOrgId = `Error: ${error.message}`;
        else authOrgId = data as string;
    } catch (e) {
        authOrgId = `Exception: ${e}`;
    }

    res.status(200).json({
        session: {
            user_id: session.user.id,
            email: session.user.email,
        },
        profile,
        profileError,
        rlsTest: {
            jobsCount,
            jobsError,
            clientsCount,
            clientsError,
            authOrgId_RPC: authOrgId
        },
        headers: req.headers
    });
}
