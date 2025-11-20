-- Create job_tasks table for task checklists
-- Migration: add_job_tasks_table

BEGIN;

CREATE TABLE IF NOT EXISTS public.job_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.job_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks for jobs in their org
CREATE POLICY "Users can view tasks in their org"
    ON public.job_tasks FOR SELECT
    USING (org_id = get_auth_org_id());

-- Users can create tasks for jobs in their org
CREATE POLICY "Users can create tasks in their org"
    ON public.job_tasks FOR INSERT
    WITH CHECK (org_id = get_auth_org_id());

-- Users can update tasks for jobs in their org
CREATE POLICY "Users can update tasks in their org"
    ON public.job_tasks FOR UPDATE
    USING (org_id = get_auth_org_id());

-- Users can delete tasks for jobs in their org
CREATE POLICY "Users can delete tasks in their org"
    ON public.job_tasks FOR DELETE
    USING (org_id = get_auth_org_id());

-- Create index for faster queries
CREATE INDEX idx_job_tasks_job_id ON public.job_tasks(job_id);
CREATE INDEX idx_job_tasks_org_id ON public.job_tasks(org_id);

COMMIT;
