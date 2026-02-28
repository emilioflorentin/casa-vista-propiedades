
CREATE OR REPLACE FUNCTION public.generate_property_reference()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_reference TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    new_reference := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    SELECT COUNT(*) INTO exists_check 
    FROM public.properties 
    WHERE properties.reference = new_reference;
    
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_reference;
END;
$$;
