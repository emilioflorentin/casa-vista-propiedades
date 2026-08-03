CREATE TABLE public.listing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('property','roomie_listing')),
  entity_id uuid NOT NULL,
  owner_id uuid,
  event_type text NOT NULL CHECK (event_type IN ('view','impression','favorite_add','favorite_remove')),
  visitor_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.listing_events TO anon;
GRANT INSERT ON public.listing_events TO authenticated;
GRANT ALL ON public.listing_events TO service_role;

ALTER TABLE public.listing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log events" ON public.listing_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_listing_events_entity ON public.listing_events (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_listing_events_owner ON public.listing_events (owner_id);

CREATE OR REPLACE FUNCTION public.get_listing_stats(p_entity_type text)
RETURNS TABLE(
  entity_id uuid,
  views bigint,
  unique_visitors bigint,
  impressions bigint,
  favorites bigint,
  views_7d bigint,
  views_30d bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    e.entity_id,
    count(*) FILTER (WHERE e.event_type = 'view'),
    count(DISTINCT e.visitor_hash) FILTER (WHERE e.event_type = 'view'),
    count(*) FILTER (WHERE e.event_type = 'impression'),
    GREATEST(
      count(*) FILTER (WHERE e.event_type = 'favorite_add')
      - count(*) FILTER (WHERE e.event_type = 'favorite_remove'), 0),
    count(*) FILTER (WHERE e.event_type = 'view' AND e.created_at > now() - interval '7 days'),
    count(*) FILTER (WHERE e.event_type = 'view' AND e.created_at > now() - interval '30 days')
  FROM public.listing_events e
  WHERE e.entity_type = p_entity_type
    AND (
      (p_entity_type = 'property' AND EXISTS (
        SELECT 1 FROM public.properties p WHERE p.id = e.entity_id AND p.user_id = auth.uid()))
      OR
      (p_entity_type = 'roomie_listing' AND EXISTS (
        SELECT 1 FROM public.roomie_listings l WHERE l.id = e.entity_id AND l.user_id = auth.uid()))
    )
  GROUP BY e.entity_id;
$$;

CREATE OR REPLACE FUNCTION public.get_listing_daily_views(p_entity_type text, p_entity_id uuid, p_days integer DEFAULT 30)
RETURNS TABLE(day date, views bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d::date AS day,
    (SELECT count(*) FROM public.listing_events e
      WHERE e.entity_type = p_entity_type
        AND e.entity_id = p_entity_id
        AND e.event_type = 'view'
        AND e.created_at::date = d::date) AS views
  FROM generate_series(now()::date - (GREATEST(p_days,1) - 1), now()::date, interval '1 day') d
  WHERE (
    (p_entity_type = 'property' AND EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = p_entity_id AND p.user_id = auth.uid()))
    OR
    (p_entity_type = 'roomie_listing' AND EXISTS (
      SELECT 1 FROM public.roomie_listings l WHERE l.id = p_entity_id AND l.user_id = auth.uid()))
  );
$$;