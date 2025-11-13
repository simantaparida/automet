/**
 * API Route: Create First Job
 * POST /api/onboarding/create-job
 *
 * Creates the first job during onboarding with optional technician assignment
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient<Database>({ req, res });
    const serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { customerId, title, technicianId, scheduledAt } = req.body;

    if (!customerId || !title || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields: customerId, title, scheduledAt' });
    }

    // Validate title length
    if (title.length < 1 || title.length > 200) {
      return res.status(400).json({ error: 'Job title must be 1-200 characters' });
    }

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    // Get user's org_id using service role (fresh data, no cache)
    const userResult = await serviceRoleSupabase
      .from('users')
      .select('org_id, role')
      .eq('id', session.user.id)
      .maybeSingle();

    const userData = userResult.data as { org_id: string | null; role: string | null } | null;
    const userError = userResult.error;

    if (userError || !userData?.org_id) {
      console.error('User org check failed:', { userError, userData, userId: session.user.id });
      return res.status(400).json({ error: 'User not part of organization' });
    }

    // Check user has permission (owner or coordinator)
    if (!['owner', 'coordinator'].includes(userData.role || '')) {
      return res.status(403).json({ error: 'Only owners and coordinators can create jobs' });
    }

    // Verify customer belongs to user's org
    const customerResult = await supabase
      .from('clients')
      .select('id, org_id')
      .eq('id', customerId)
      .maybeSingle();

    const customer = customerResult.data as { id: string; org_id: string } | null;
    const customerError = customerResult.error;

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (customer.org_id !== userData.org_id) {
      return res.status(403).json({ error: 'Customer does not belong to your organization' });
    }

    // If technician provided, verify they belong to org
    if (technicianId) {
      const techResult = await supabase
        .from('users')
        .select('id, org_id, role')
        .eq('id', technicianId)
        .maybeSingle();

      const technician = techResult.data as { id: string; org_id: string | null; role: string | null } | null;
      const techError = techResult.error;

      if (techError || !technician) {
        return res.status(404).json({ error: 'Technician not found' });
      }

      if (technician.org_id !== userData.org_id) {
        return res.status(403).json({ error: 'Technician does not belong to your organization' });
      }
    }

    // Create job using service role to bypass RLS
    const { data: job, error: jobError } = await serviceRoleSupabase
      .from('jobs')
      .insert({
        org_id: userData.org_id,
        client_id: customerId,
        title,
        status: 'scheduled',
        scheduled_at: scheduledAt,
        priority: 'medium',
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);
      return res.status(500).json({ error: jobError.message });
    }

    // If technician assigned, create job assignment
    if (technicianId) {
      const { error: assignmentError } = await serviceRoleSupabase
        .from('job_assignments')
        .insert({
          job_id: job.id,
          user_id: technicianId,
          is_primary: true,
        });

      if (assignmentError) {
        console.error('Assignment creation error:', assignmentError);
        // Don't fail the whole request if assignment fails
        return res.status(200).json({
          success: true,
          job: {
            id: job.id,
            title: job.title,
            status: job.status,
            customerId: job.client_id,
            scheduledAt: job.scheduled_at,
            createdAt: job.created_at,
          },
          warning: 'Job created but technician assignment failed',
        });
      }
    }

    return res.status(200).json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        customerId: job.client_id,
        technicianId: technicianId || null,
        scheduledAt: job.scheduled_at,
        createdAt: job.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create job API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
