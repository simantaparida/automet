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

  const { id } = req.query;

  // Validate id parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  const jobId = id;

  if (req.method === 'POST') {
    // Assign technician to job
    try {
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      // Check if assignment already exists
      const { data: existing } = await supabaseAdmin
        .from('job_assignments')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user_id)
        .single();

      if (existing) {
        return res
          .status(400)
          .json({ error: 'Technician already assigned to this job' });
      }

      // Create new assignment
      const { data, error } = await supabaseAdmin
        .from('job_assignments')
        // @ts-expect-error - Supabase type inference issue with insert
        .insert({
          job_id: jobId,
          user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          id,
          started_at,
          completed_at,
          notes,
          user:users(id, email, role)
        `
        )
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Remove technician assignment
    try {
      const { assignment_id } = req.body;

      if (!assignment_id) {
        return res.status(400).json({ error: 'assignment_id is required' });
      }

      const { error } = await supabaseAdmin
        .from('job_assignments')
        .delete()
        .eq('id', assignment_id)
        .eq('job_id', jobId);

      if (error) throw error;

      return res
        .status(200)
        .json({ message: 'Assignment removed successfully' });
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
