CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'advisor',
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_company_owner(_user_id uuid, _company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE user_id=_user_id AND company_id=_company_id AND role='owner' AND is_active);
$$;

CREATE OR REPLACE FUNCTION public.owner_manages_user(_owner uuid, _target uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members o JOIN public.company_members t ON t.company_id=o.company_id
    WHERE o.user_id=_owner AND o.role='owner' AND o.is_active AND t.user_id=_target);
$$;

CREATE POLICY "Members see own row" ON public.company_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners see company members" ON public.company_members FOR SELECT TO authenticated USING (public.is_company_owner(auth.uid(), company_id));
CREATE POLICY "Superadmin sees members" ON public.company_members FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'superadmin'));

CREATE POLICY "Members view their company" ON public.companies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.company_members m WHERE m.company_id = companies.id AND m.user_id = auth.uid()));

CREATE POLICY "Company owners update advisor properties" ON public.properties FOR UPDATE TO authenticated USING (public.owner_manages_user(auth.uid(), user_id));
CREATE POLICY "Company owners delete advisor properties" ON public.properties FOR DELETE TO authenticated USING (public.owner_manages_user(auth.uid(), user_id));

CREATE OR REPLACE FUNCTION public.get_company_usage(p_company_id uuid)
RETURNS TABLE(max_listings integer, max_advisors integer, used_listings bigint, used_advisors bigint, company_status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(c.custom_max_listings, p.max_listings, 0),
         COALESCE(c.custom_max_advisors, p.max_advisors, 0),
         (SELECT count(*) FROM public.properties pr JOIN public.company_members m ON m.user_id=pr.user_id WHERE m.company_id=c.id),
         (SELECT count(*) FROM public.company_members m WHERE m.company_id=c.id AND m.role='advisor' AND m.is_active),
         c.status
  FROM public.companies c LEFT JOIN public.plans p ON p.id=c.plan_id
  WHERE c.id = p_company_id
    AND (EXISTS (SELECT 1 FROM public.company_members m WHERE m.company_id=c.id AND m.user_id=auth.uid())
         OR public.has_role(auth.uid(),'superadmin') OR auth.role()='service_role');
$$;

CREATE OR REPLACE FUNCTION public.enforce_company_listing_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_company uuid; v_active boolean; v_status text; v_max int; v_used bigint;
BEGIN
  SELECT m.company_id, m.is_active INTO v_company, v_active FROM public.company_members m WHERE m.user_id = NEW.user_id;
  IF v_company IS NULL THEN RETURN NEW; END IF;
  IF NOT v_active THEN RAISE EXCEPTION 'Tu cuenta de asesor está desactivada'; END IF;
  SELECT c.status, COALESCE(c.custom_max_listings, p.max_listings, 0) INTO v_status, v_max
    FROM public.companies c LEFT JOIN public.plans p ON p.id=c.plan_id WHERE c.id=v_company;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'La empresa no está activa'; END IF;
  SELECT count(*) INTO v_used FROM public.properties pr JOIN public.company_members m ON m.user_id=pr.user_id WHERE m.company_id=v_company;
  IF v_used >= v_max THEN RAISE EXCEPTION 'La empresa ha alcanzado el límite de % anuncios de su plan', v_max; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER properties_company_limit BEFORE INSERT ON public.properties FOR EACH ROW EXECUTE FUNCTION public.enforce_company_listing_limit();
REVOKE EXECUTE ON FUNCTION public.enforce_company_listing_limit() FROM anon, authenticated, public;