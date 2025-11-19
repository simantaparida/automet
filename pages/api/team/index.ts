import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withOnboardedAuth, requireRole } from '@/lib/auth-middleware';
import { logError } from '@/lib/logger';
import type { Database } from '@/types/database';

type TypedClient = SupabaseClient<Database>;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const authResult = await withOnboardedAuth(req, res);
    if (!authResult.authenticated) {
        return;
    }

    const { user, supabase } = authResult;

    // Handle DELETE: Remove a user
    if (req.method === 'DELETE') {
        // Only owners can remove users
        if (!requireRole(user, ['owner'], res)) {
            return;
        }

        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Prevent removing yourself
        if (userId === user.id) {
            return res.status(400).json({ error: 'You cannot remove yourself' });
        }

        try {
            const typed = supabase as unknown as TypedClient;

            // Delete the user from the public users table
            const { error: deleteError } = await typed
                .from('users')
                .delete()
                .eq('id', userId)
                .eq('org_id', user.org_id!);

            if (deleteError) {
                throw deleteError;
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            logError('Error removing user:', error);
            return res.status(500).json({ error: 'Failed to remove user' });
        }
    }

    // Handle PATCH: Update a user's role
    if (req.method === 'PATCH') {
        // Only owners can update roles
        if (!requireRole(user, ['owner'], res)) {
            return;
        }

        const { userId, role } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }

        if (!['owner', 'coordinator', 'technician'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Prevent changing your own role
        if (userId === user.id) {
            return res.status(400).json({ error: 'You cannot change your own role' });
        }

        try {
            const typed = supabase as unknown as TypedClient;

            const { error: updateError } = await typed
                .from('users')
                .update({ role } as any)
                .eq('id', userId)
                .eq('org_id', user.org_id!);

            if (updateError) {
                throw updateError;
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            logError('Error updating user role:', error);
            return res.status(500).json({ error: 'Failed to update user role' });
        }
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Only owners and coordinators can view the team list
    if (!requireRole(user, ['owner', 'coordinator'], res)) {
        return;
    }

    try {
        const typed = supabase as unknown as TypedClient;

        // Fetch users in the organization
        const { data: users, error: usersError } = await typed
            .from('users')
            .select('id, email, full_name, role, created_at')
            .eq('org_id', user.org_id!)
            .order('created_at', { ascending: false });

        if (usersError) {
            throw usersError;
        }

        // Fetch pending invites
        const { data: invites, error: invitesError } = await typed
            .from('user_invites')
            .select('id, contact, name, role, created_at, status')
            .eq('org_id', user.org_id!)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        // Handle RLS permission errors gracefully (return empty array)
        if (invitesError) {
            if (invitesError.code === '42501') {
                // Permission denied - RLS policy blocking access
                // Return empty invites array instead of failing
                console.warn('RLS permission denied for user_invites, returning empty array');
            } else {
                throw invitesError;
            }
        }

        return res.status(200).json({
            users: users || [],
            invites: invites || [],
        });
    } catch (error) {
        logError('Error fetching team members:', error);
        return res.status(500).json({ error: 'Failed to fetch team members' });
    }
}
