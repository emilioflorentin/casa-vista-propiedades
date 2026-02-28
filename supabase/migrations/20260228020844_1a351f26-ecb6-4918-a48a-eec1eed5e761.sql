
-- Table to permanently store resolved incident data for reporting
CREATE TABLE public.incident_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  property_title text,
  property_location text,
  tenant_name text,
  tenant_phone text,
  repair_cost numeric DEFAULT 0,
  materials_cost numeric DEFAULT 0,
  total_cost numeric GENERATED ALWAYS AS (COALESCE(repair_cost, 0) + COALESCE(materials_cost, 0)) STORED,
  charge_amount numeric DEFAULT 0,
  profit numeric GENERATED ALWAYS AS (COALESCE(charge_amount, 0) - (COALESCE(repair_cost, 0) + COALESCE(materials_cost, 0))) STORED,
  receipts text[] DEFAULT '{}',
  incident_created_at timestamp with time zone,
  resolved_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incident_history ENABLE ROW LEVEL SECURITY;

-- Only multiservicios can access
CREATE POLICY "Multiservicios can view history"
  ON public.incident_history FOR SELECT
  USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can insert history"
  ON public.incident_history FOR INSERT
  WITH CHECK (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can update history"
  ON public.incident_history FOR UPDATE
  USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can delete history"
  ON public.incident_history FOR DELETE
  USING (auth.email() = 'multiservicios@nazarihomes.com');
