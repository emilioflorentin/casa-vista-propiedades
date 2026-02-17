
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_resolved_incidents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.incidents
  WHERE status = 'resolved'
    AND updated_at < now() - interval '10 days';
END;
$$;

-- Allow DELETE for the cleanup (RLS policy)
CREATE POLICY "System can delete resolved incidents"
ON public.incidents
FOR DELETE
USING (status = 'resolved' AND updated_at < now() - interval '10 days');
