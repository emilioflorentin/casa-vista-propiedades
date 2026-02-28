
-- Update Multiservicios view policy to include pending_payment
DROP POLICY IF EXISTS "Multiservicios can view incidents" ON public.incidents;
CREATE POLICY "Multiservicios can view incidents" 
ON public.incidents 
FOR SELECT 
USING ((auth.email() = 'multiservicios@nazarihomes.com'::text) AND (status = ANY (ARRAY['approval'::text, 'in_progress'::text, 'paused'::text, 'pending_payment'::text, 'resolved'::text])));

-- Update Multiservicios update policy to include pending_payment
DROP POLICY IF EXISTS "Multiservicios can update incidents" ON public.incidents;
CREATE POLICY "Multiservicios can update incidents" 
ON public.incidents 
FOR UPDATE 
USING ((auth.email() = 'multiservicios@nazarihomes.com'::text) AND (status = ANY (ARRAY['in_progress'::text, 'paused'::text, 'pending_payment'::text, 'resolved'::text])));

-- Also let owners view/update pending_payment incidents
DROP POLICY IF EXISTS "Owners can view incidents for their properties" ON public.incidents;
CREATE POLICY "Owners can view incidents for their properties" 
ON public.incidents 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM properties WHERE properties.id = incidents.property_id AND properties.user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update incidents for their properties" ON public.incidents;
CREATE POLICY "Owners can update incidents for their properties" 
ON public.incidents 
FOR UPDATE 
USING (EXISTS ( SELECT 1 FROM properties WHERE properties.id = incidents.property_id AND properties.user_id = auth.uid()));
