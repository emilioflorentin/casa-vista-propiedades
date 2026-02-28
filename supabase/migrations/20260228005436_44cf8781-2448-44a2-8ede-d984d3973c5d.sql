
-- Drop existing multiservicios policies on incidents
DROP POLICY IF EXISTS "Multiservicios can view in-progress incidents" ON public.incidents;
DROP POLICY IF EXISTS "Multiservicios can update incident status" ON public.incidents;

-- Multiservicios can view incidents in approval, in_progress, paused, resolved
CREATE POLICY "Multiservicios can view incidents"
ON public.incidents
FOR SELECT
USING (
  auth.email() = 'multiservicios@nazarihomes.com'
  AND status IN ('approval', 'in_progress', 'paused', 'resolved')
);

-- Multiservicios can update incidents only when NOT in approval status
CREATE POLICY "Multiservicios can update incidents"
ON public.incidents
FOR UPDATE
USING (
  auth.email() = 'multiservicios@nazarihomes.com'
  AND status IN ('in_progress', 'paused', 'resolved')
);
