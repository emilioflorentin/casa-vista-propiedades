
-- Table for tenant access codes (UUID given by property manager at contract signing)
CREATE TABLE public.tenant_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_name text NOT NULL,
  tenant_email text,
  tenant_phone text,
  access_code uuid NOT NULL DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(access_code)
);

ALTER TABLE public.tenant_access ENABLE ROW LEVEL SECURITY;

-- Property owners can manage their tenant access codes
CREATE POLICY "Owners can view their tenant access codes"
ON public.tenant_access FOR SELECT
USING (EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tenant_access.property_id AND properties.user_id = auth.uid()
));

CREATE POLICY "Owners can create tenant access codes"
ON public.tenant_access FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tenant_access.property_id AND properties.user_id = auth.uid()
) AND auth.uid() = created_by);

CREATE POLICY "Owners can update tenant access codes"
ON public.tenant_access FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tenant_access.property_id AND properties.user_id = auth.uid()
));

CREATE POLICY "Owners can delete tenant access codes"
ON public.tenant_access FOR DELETE
USING (EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tenant_access.property_id AND properties.user_id = auth.uid()
));

-- Incidents table
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_access_id uuid NOT NULL REFERENCES public.tenant_access(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'pending',
  images text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Owners can see incidents for their properties
CREATE POLICY "Owners can view incidents for their properties"
ON public.incidents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM properties WHERE properties.id = incidents.property_id AND properties.user_id = auth.uid()
));

-- Owners can update incident status
CREATE POLICY "Owners can update incidents for their properties"
ON public.incidents FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM properties WHERE properties.id = incidents.property_id AND properties.user_id = auth.uid()
));

-- We need anon insert for incidents (tenant is not authenticated)
CREATE POLICY "Anyone can create incidents with valid access code"
ON public.incidents FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM tenant_access WHERE tenant_access.id = incidents.tenant_access_id AND tenant_access.is_active = true
));

-- Also need anon select on tenant_access to validate codes
CREATE POLICY "Anyone can validate access codes"
ON public.tenant_access FOR SELECT
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_tenant_access_updated_at
BEFORE UPDATE ON public.tenant_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for incident images
INSERT INTO storage.buckets (id, name, public) VALUES ('incident-images', 'incident-images', true);

-- Anyone can upload incident images (tenant is not authenticated)
CREATE POLICY "Anyone can upload incident images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'incident-images');

-- Anyone can view incident images
CREATE POLICY "Anyone can view incident images"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-images');

-- Function to validate tenant access code and return tenant info (no auth needed)
CREATE OR REPLACE FUNCTION public.validate_tenant_access(p_access_code uuid)
RETURNS TABLE(tenant_access_id uuid, property_id uuid, tenant_name text, property_title text, property_location text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ta.id as tenant_access_id,
    ta.property_id,
    ta.tenant_name,
    p.title as property_title,
    p.location as property_location
  FROM public.tenant_access ta
  JOIN public.properties p ON p.id = ta.property_id
  WHERE ta.access_code = p_access_code AND ta.is_active = true;
$$;

-- Function to create incident (no auth needed, validates access code)
CREATE OR REPLACE FUNCTION public.create_incident(
  p_access_code uuid,
  p_title text,
  p_description text,
  p_category text DEFAULT 'other',
  p_images text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_access_id uuid;
  v_property_id uuid;
  v_incident_id uuid;
BEGIN
  -- Validate access code
  SELECT ta.id, ta.property_id INTO v_tenant_access_id, v_property_id
  FROM public.tenant_access ta
  WHERE ta.access_code = p_access_code AND ta.is_active = true;
  
  IF v_tenant_access_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive access code';
  END IF;
  
  -- Create incident
  INSERT INTO public.incidents (tenant_access_id, property_id, title, description, category, images)
  VALUES (v_tenant_access_id, v_property_id, p_title, p_description, p_category, p_images)
  RETURNING id INTO v_incident_id;
  
  RETURN v_incident_id;
END;
$$;

-- Allow anon to read incidents they created (by access code)
CREATE OR REPLACE FUNCTION public.get_tenant_incidents(p_access_code uuid)
RETURNS TABLE(
  id uuid, title text, description text, category text, status text, 
  images text[], created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.title, i.description, i.category, i.status, i.images, i.created_at, i.updated_at
  FROM public.incidents i
  JOIN public.tenant_access ta ON ta.id = i.tenant_access_id
  WHERE ta.access_code = p_access_code AND ta.is_active = true
  ORDER BY i.created_at DESC;
$$;
