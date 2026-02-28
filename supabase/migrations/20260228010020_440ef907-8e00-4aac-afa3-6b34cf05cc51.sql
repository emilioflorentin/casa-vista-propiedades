
CREATE OR REPLACE FUNCTION public.generate_budget_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year text;
  current_month text;
  next_seq integer;
  prefix text;
BEGIN
  current_year := to_char(now(), 'YYYY');
  current_month := to_char(now(), 'MM');
  prefix := 'PRE-' || current_year || '-' || current_month || '-';
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN budget_number LIKE prefix || '%' 
      THEN NULLIF(regexp_replace(budget_number, '^' || prefix, ''), '')::integer
      ELSE 0
    END
  ), 0) + 1
  INTO next_seq
  FROM public.budgets;
  
  RETURN prefix || next_seq::text;
END;
$$;
