import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { role } = req.query;
    const roleOptions = ['owner', 'coordinator', 'technician'] as const;
    type RoleOption = (typeof roleOptions)[number];
    const roleFilter: RoleOption | undefined =
      typeof role === 'string' && roleOptions.includes(role as RoleOption)
        ? (role as RoleOption)
        : undefined;

    let query = supabaseAdmin
      .from('users')
      .select('id, email, role')
      .order('email');

    // Filter by role if specified (e.g., technician)
    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: error.message });
  }
}
