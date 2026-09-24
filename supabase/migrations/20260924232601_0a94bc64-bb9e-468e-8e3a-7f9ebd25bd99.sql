CREATE OR REPLACE FUNCTION public.roomie_listing_owner_must_be_particular()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
BEGIN
  SELECT user_type INTO v_user_type FROM public.profiles WHERE id = NEW.user_id;
  IF v_user_type = 'empresa' THEN
    RAISE EXCEPTION 'Las cuentas de empresa no pueden publicar en Roomie Finder';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS roomie_listing_owner_particular ON public.roomie_listings;
CREATE TRIGGER roomie_listing_owner_particular
BEFORE INSERT OR UPDATE ON public.roomie_listings
FOR EACH ROW EXECUTE FUNCTION public.roomie_listing_owner_must_be_particular();