
-- Make incident_id nullable in incident_costs and add internal_task_id
ALTER TABLE public.incident_costs 
  ALTER COLUMN incident_id DROP NOT NULL;

ALTER TABLE public.incident_costs 
  ADD COLUMN internal_task_id uuid REFERENCES public.internal_tasks(id) ON DELETE CASCADE;

-- Ensure at least one reference is set
ALTER TABLE public.incident_costs
  ADD CONSTRAINT costs_must_have_reference 
  CHECK ((incident_id IS NOT NULL) OR (internal_task_id IS NOT NULL));

-- Drop the one-to-one unique constraint on incident_id if it exists, and recreate allowing nulls
-- (The FK already exists, just need to handle the unique aspect)

-- Add is_internal_task flag to incident_history
ALTER TABLE public.incident_history
  ADD COLUMN is_internal_task boolean NOT NULL DEFAULT false;

-- Make incident_id nullable in incident_history (internal tasks use this field too)
ALTER TABLE public.incident_history
  ALTER COLUMN incident_id DROP NOT NULL;

-- Add internal_task_id to incident_history  
ALTER TABLE public.incident_history
  ADD COLUMN internal_task_id uuid;

-- Update cleanup function to also clean resolved internal tasks after 10 days
CREATE OR REPLACE FUNCTION public.cleanup_resolved_incidents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.incidents
  WHERE status IN ('resolved', 'rejected')
    AND updated_at < now() - interval '10 days';
    
  DELETE FROM public.internal_tasks
  WHERE status = 'resolved'
    AND updated_at < now() - interval '10 days';
END;
$$;
