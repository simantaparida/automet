import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createPagesServerClient({ req, res });

  // 1. Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = session.user;
  const userId = user.id;

  const results: Record<string, unknown> = {
    step1_auth: 'Success',
    userId,
  };

  try {
    // 2. Try to read own profile
    const { data: profile, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (readError) {
      results.step2_read = { status: 'Failed', error: readError };
    } else {
      results.step2_read = { status: 'Success', profile };
    }

    // 3. Try to update own profile (dry run with timestamp)
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      results.step3_update = { status: 'Failed', error: updateError };
    } else {
      results.step3_update = { status: 'Success', data: updateData };
    }

    // 4. Check RLS policies (if possible via inspection, but we can't easily from here)
    // Instead we rely on the error codes above.

    return res.status(200).json(results);
  } catch (err) {
    console.error('Diagnosis error:', err);
    return res.status(500).json({
      error: 'Diagnosis failed',
      details: err instanceof Error ? err.message : 'Unknown error',
      results,
    });
  }
}
