ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN public.properties.latitude IS 'Latitude of the geocoded property address';
COMMENT ON COLUMN public.properties.longitude IS 'Longitude of the geocoded property address';