CREATE TABLE public.company_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.company_requests TO anon;
GRANT INSERT, SELECT ON public.company_requests TO authenticated;
GRANT ALL ON public.company_requests TO service_role;
ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a company request" ON public.company_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Nazari staff can read company requests" ON public.company_requests FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email') LIKE '%@nazarihomes.com'));