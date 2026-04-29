CREATE TABLE public.short_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  target_url text NOT NULL,
  property_id uuid,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_short_links_code ON public.short_links(code);
CREATE INDEX idx_short_links_property_id ON public.short_links(property_id);

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Short links are publicly readable"
ON public.short_links
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create short links"
ON public.short_links
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can increment click count"
ON public.short_links
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Function to get or create a short link for a property URL
CREATE OR REPLACE FUNCTION public.get_or_create_short_link(p_target_url text, p_property_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_existing_code text;
  v_attempts integer := 0;
BEGIN
  -- Check if a short link already exists for this URL
  SELECT code INTO v_existing_code
  FROM public.short_links
  WHERE target_url = p_target_url
  LIMIT 1;
  
  IF v_existing_code IS NOT NULL THEN
    RETURN v_existing_code;
  END IF;
  
  -- Generate a unique 6-character code
  LOOP
    v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    BEGIN
      INSERT INTO public.short_links (code, target_url, property_id)
      VALUES (v_code, p_target_url, p_property_id);
      RETURN v_code;
    EXCEPTION WHEN unique_violation THEN
      v_attempts := v_attempts + 1;
      IF v_attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique code';
      END IF;
    END;
  END LOOP;
END;
$$;