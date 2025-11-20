import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from '@/types/database';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Verify Session (Authentication)
  const supabaseAuth = createServerSupabaseClient<Database>({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabaseAuth.auth.getSession();

  if (sessionError || !session) {
    return res.status(401).json({ error: 'No session', sessionError });
  }

  // 2. Get Admin Client (Bypass RLS)
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Supabase Admin client not available',
    });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  if (!userEmail) {
    return res.status(400).json({ error: 'User email not found in session' });
  }

  const orgId = '59d98f0b-0799-0000-0000-000000000001'; // Fixed Test Org ID

  // 3. Ensure Organization Exists (using Admin client)
  const { error: orgError } = await supabaseAdmin
    .from('organizations')
    .upsert({
      id: orgId,
      name: 'Test Organization',
      slug: 'test-organization',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (orgError) {
    return res
      .status(500)
      .json({ error: 'Failed to upsert organization', details: orgError });
  }

  // 4. Fix User Profile (using Admin client)
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      email: userEmail,
      org_id: orgId,
      role: 'owner',
      full_name: 'Test Owner',
      email_confirmed: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (userError) {
    return res
      .status(500)
      .json({ error: 'Failed to upsert user', details: userError });
  }

  res.status(200).json({
    message: 'Account fixed successfully',
    user,
    orgId,
  });
}
