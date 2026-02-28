-- Allow multiservicios@nazarihomes.com to view all in-progress and pending incidents
CREATE POLICY "Multiservicios can view in-progress incidents"
ON public.incidents
FOR SELECT
USING (
  auth.email() = 'multiservicios@nazarihomes.com'
  AND status IN ('in_progress', 'resolved')
);

-- Allow multiservicios to update incident status
CREATE POLICY "Multiservicios can update incident status"
ON public.incidents
FOR UPDATE
USING (
  auth.email() = 'multiservicios@nazarihomes.com'
  AND status IN ('in_progress', 'resolved')
);