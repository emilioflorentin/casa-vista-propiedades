-- Update cleanup function to also delete rejected incidents after 10 days
CREATE OR REPLACE FUNCTION public.cleanup_resolved_incidents()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.incidents
  WHERE status IN ('resolved', 'rejected')
    AND updated_at < now() - interval '10 days';
END;
$function$;

-- Update RLS delete policy to also allow deleting rejected incidents after 10 days
DROP POLICY IF EXISTS "System can delete resolved incidents" ON public.incidents;
CREATE POLICY "System can delete resolved incidents"
  ON public.incidents
  FOR DELETE
  USING (status IN ('resolved', 'rejected') AND updated_at < (now() - interval '10 days'));
