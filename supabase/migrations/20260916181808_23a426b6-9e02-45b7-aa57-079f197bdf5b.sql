-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'superadmin'));

-- Auto-grant superadmin to admin@pisos-go.com when email is verified
CREATE OR REPLACE FUNCTION public.grant_superadmin_for_verified_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'admin@pisos-go.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_superadmin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_superadmin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_superadmin_for_verified_email();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_superadmin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_superadmin
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_superadmin_for_verified_email();

-- PLANS
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_monthly numeric NOT NULL DEFAULT 0,
  max_listings integer NOT NULL DEFAULT 3,
  max_advisors integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can insert plans"
ON public.plans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update plans"
ON public.plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can delete plans"
ON public.plans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plans (slug, name, description, price_monthly, max_listings, max_advisors, sort_order) VALUES
  ('basico', 'Básico', 'Para agencias que empiezan', 29, 10, 2, 1),
  ('pro', 'Pro', 'Para agencias en crecimiento', 79, 50, 6, 2),
  ('premium', 'Premium', 'Anuncios y asesores ilimitados', 199, 9999, 9999, 3);

-- COMPANIES
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid,
  company_name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  custom_max_listings integer,
  custom_max_advisors integer,
  services jsonb NOT NULL DEFAULT '{"publish_properties": true, "roomie_finder": false, "rental_management": false, "incidents": false, "documents": false, "budgets": false}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  notes text NOT NULL DEFAULT '',
  request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin manages companies"
ON public.companies FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Company can view own record"
ON public.companies FOR SELECT TO authenticated
USING (owner_user_id = auth.uid() OR lower(email) = lower(coalesce(auth.email(), '')));

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMPANY REQUESTS review fields
ALTER TABLE public.company_requests
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_notes text NOT NULL DEFAULT '';

DROP POLICY IF EXISTS "Superadmin can view company requests" ON public.company_requests;
CREATE POLICY "Superadmin can view company requests"
ON public.company_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'superadmin') OR lower(coalesce(auth.email(), '')) LIKE '%@nazarihomes.com');

DROP POLICY IF EXISTS "Superadmin can update company requests" ON public.company_requests;
CREATE POLICY "Superadmin can update company requests"
ON public.company_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

GRANT SELECT, INSERT, UPDATE ON public.company_requests TO authenticated;
GRANT ALL ON public.company_requests TO service_role;