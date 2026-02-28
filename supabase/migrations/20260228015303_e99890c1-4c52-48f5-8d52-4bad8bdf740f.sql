
-- Create table for incident costs, only accessible by multiservicios
CREATE TABLE public.incident_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  repair_cost numeric DEFAULT 0,
  materials_cost numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(incident_id)
);

ALTER TABLE public.incident_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Multiservicios can view incident costs"
ON public.incident_costs FOR SELECT
USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can insert incident costs"
ON public.incident_costs FOR INSERT
WITH CHECK (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can update incident costs"
ON public.incident_costs FOR UPDATE
USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can delete incident costs"
ON public.incident_costs FOR DELETE
USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE TRIGGER update_incident_costs_updated_at
BEFORE UPDATE ON public.incident_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
