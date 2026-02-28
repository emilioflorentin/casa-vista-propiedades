
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  budget_number text NOT NULL,
  title text,
  client_name text,
  client_nif text,
  client_address text,
  client_phone text,
  client_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  validity_days integer DEFAULT 30,
  execution_days text,
  payment_terms text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Multiservicios can manage budgets"
ON public.budgets FOR ALL
USING (auth.email() = 'multiservicios@nazarihomes.com')
WITH CHECK (auth.email() = 'multiservicios@nazarihomes.com');

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
