-- 1. Plataforma en perfiles de cuenta (Nazarí Homes vs Roomie Finder)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'nazari';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, user_type, company_name, phone, email, platform)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'phone',
    new.email,
    COALESCE(new.raw_user_meta_data->>'platform', 'nazari')
  );
  RETURN new;
END;
$function$;

-- 2. Tabla independiente de buscadores de habitación (sin cuenta)
CREATE TABLE public.roomie_seekers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age integer,
  gender text NOT NULL DEFAULT 'other',
  occupation text NOT NULL DEFAULT 'works',
  schedule text NOT NULL DEFAULT 'mixed',
  social_level text NOT NULL DEFAULT 'balanced',
  smoker boolean NOT NULL DEFAULT false,
  has_pets boolean NOT NULL DEFAULT false,
  cleanliness text NOT NULL DEFAULT 'normal',
  languages text[] NOT NULL DEFAULT '{}',
  budget_max numeric,
  desired_area text NOT NULL DEFAULT '',
  move_in_date date,
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.roomie_seekers TO service_role;

ALTER TABLE public.roomie_seekers ENABLE ROW LEVEL SECURITY;

-- Sin políticas: el acceso es exclusivamente vía funciones SECURITY DEFINER

CREATE TRIGGER update_roomie_seekers_updated_at
BEFORE UPDATE ON public.roomie_seekers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Limpieza de datos de prueba y reapuntado de likes/matches
DELETE FROM public.roomie_matches;
DELETE FROM public.roomie_likes;
DROP TABLE IF EXISTS public.roomie_profiles CASCADE;

ALTER TABLE public.roomie_likes
  ADD CONSTRAINT roomie_likes_seeker_fk FOREIGN KEY (seeker_id)
  REFERENCES public.roomie_seekers(id) ON DELETE CASCADE;

ALTER TABLE public.roomie_matches
  ADD CONSTRAINT roomie_matches_seeker_fk FOREIGN KEY (seeker_id)
  REFERENCES public.roomie_seekers(id) ON DELETE CASCADE;

-- 4. Funciones públicas para buscadores sin cuenta
CREATE OR REPLACE FUNCTION public.roomie_seeker_upsert(
  p_token uuid,
  p_full_name text,
  p_phone text,
  p_age integer DEFAULT NULL,
  p_gender text DEFAULT 'other',
  p_occupation text DEFAULT 'works',
  p_schedule text DEFAULT 'mixed',
  p_social_level text DEFAULT 'balanced',
  p_smoker boolean DEFAULT false,
  p_has_pets boolean DEFAULT false,
  p_cleanliness text DEFAULT 'normal',
  p_languages text[] DEFAULT '{}',
  p_budget_max numeric DEFAULT NULL,
  p_desired_area text DEFAULT '',
  p_move_in_date date DEFAULT NULL,
  p_bio text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_token uuid;
BEGIN
  IF coalesce(trim(p_full_name), '') = '' OR coalesce(trim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'Nombre y teléfono son obligatorios';
  END IF;
  IF length(p_full_name) > 100 OR length(p_phone) > 30 OR length(coalesce(p_bio, '')) > 1000 THEN
    RAISE EXCEPTION 'Datos demasiado largos';
  END IF;

  IF p_token IS NOT NULL THEN
    UPDATE public.roomie_seekers SET
      full_name = trim(p_full_name), phone = trim(p_phone), age = p_age, gender = p_gender,
      occupation = p_occupation, schedule = p_schedule, social_level = p_social_level,
      smoker = p_smoker, has_pets = p_has_pets, cleanliness = p_cleanliness,
      languages = coalesce(p_languages, '{}'), budget_max = p_budget_max,
      desired_area = coalesce(p_desired_area, ''), move_in_date = p_move_in_date,
      bio = coalesce(p_bio, '')
    WHERE seeker_token = p_token
    RETURNING seeker_token INTO v_token;

    IF v_token IS NOT NULL THEN
      RETURN v_token;
    END IF;
  END IF;

  INSERT INTO public.roomie_seekers (
    full_name, phone, age, gender, occupation, schedule, social_level, smoker, has_pets,
    cleanliness, languages, budget_max, desired_area, move_in_date, bio
  ) VALUES (
    trim(p_full_name), trim(p_phone), p_age, p_gender, p_occupation, p_schedule, p_social_level,
    p_smoker, p_has_pets, p_cleanliness, coalesce(p_languages, '{}'), p_budget_max,
    coalesce(p_desired_area, ''), p_move_in_date, coalesce(p_bio, '')
  )
  RETURNING seeker_token INTO v_token;

  RETURN v_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.roomie_seeker_get(p_token uuid)
RETURNS TABLE(
  full_name text, age integer, gender text, occupation text, schedule text, social_level text,
  smoker boolean, has_pets boolean, cleanliness text, languages text[], budget_max numeric,
  desired_area text, move_in_date date, bio text, phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT s.full_name, s.age, s.gender, s.occupation, s.schedule, s.social_level, s.smoker,
         s.has_pets, s.cleanliness, s.languages, s.budget_max, s.desired_area, s.move_in_date,
         s.bio, s.phone
  FROM public.roomie_seekers s
  WHERE s.seeker_token = p_token;
$function$;

CREATE OR REPLACE FUNCTION public.roomie_seeker_like(p_token uuid, p_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_seeker uuid;
  v_owner uuid;
BEGIN
  SELECT id INTO v_seeker FROM public.roomie_seekers WHERE seeker_token = p_token;
  IF v_seeker IS NULL THEN
    RAISE EXCEPTION 'Perfil de búsqueda no encontrado';
  END IF;

  SELECT user_id INTO v_owner FROM public.roomie_listings WHERE id = p_listing_id AND is_active = true;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Anuncio no disponible';
  END IF;

  INSERT INTO public.roomie_likes (listing_id, seeker_id, owner_id, direction)
  VALUES (p_listing_id, v_seeker, v_owner, 'seeker')
  ON CONFLICT DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.roomie_seeker_likes(p_token uuid)
RETURNS TABLE(listing_id uuid, is_matched boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT lk.listing_id,
         EXISTS (SELECT 1 FROM public.roomie_matches m
                 WHERE m.listing_id = lk.listing_id AND m.seeker_id = lk.seeker_id)
  FROM public.roomie_likes lk
  JOIN public.roomie_seekers s ON s.id = lk.seeker_id
  WHERE s.seeker_token = p_token AND lk.direction = 'seeker';
$function$;

CREATE OR REPLACE FUNCTION public.roomie_seeker_matches(p_token uuid)
RETURNS TABLE(
  listing_id uuid, title text, municipality text, rent_amount numeric, image text,
  owner_name text, owner_phone text, matched_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT l.id, l.title, l.municipality, l.rent_amount,
         COALESCE(l.room_images[1], l.home_images[1]),
         COALESCE(pr.full_name, l.title),
         l.contact_phone,
         m.created_at
  FROM public.roomie_matches m
  JOIN public.roomie_listings l ON l.id = m.listing_id
  JOIN public.roomie_seekers s ON s.id = m.seeker_id
  LEFT JOIN public.profiles pr ON pr.id = l.user_id
  WHERE s.seeker_token = p_token
  ORDER BY m.created_at DESC;
$function$;

-- 5. Funciones del anunciante adaptadas a la nueva tabla
DROP FUNCTION IF EXISTS public.get_roomie_applicants(uuid);
CREATE FUNCTION public.get_roomie_applicants(p_listing_id uuid)
RETURNS TABLE(
  seeker_id uuid, full_name text, age integer, gender text, occupation text, schedule text,
  social_level text, smoker boolean, has_pets boolean, cleanliness text, languages text[],
  budget_max numeric, desired_area text, move_in_date date, bio text, avatar_url text,
  liked_at timestamptz, is_matched boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT s.id, s.full_name, s.age, s.gender, s.occupation, s.schedule, s.social_level,
         s.smoker, s.has_pets, s.cleanliness, s.languages, s.budget_max, s.desired_area,
         s.move_in_date, s.bio, s.avatar_url, lk.created_at,
         EXISTS (SELECT 1 FROM public.roomie_matches m
                 WHERE m.listing_id = lk.listing_id AND m.seeker_id = lk.seeker_id)
  FROM public.roomie_likes lk
  JOIN public.roomie_seekers s ON s.id = lk.seeker_id
  WHERE lk.listing_id = p_listing_id
    AND lk.direction = 'seeker'
    AND EXISTS (SELECT 1 FROM public.roomie_listings l
                WHERE l.id = p_listing_id AND l.user_id = auth.uid())
  ORDER BY lk.created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_roomie_match_contact(p_listing_id uuid, p_seeker_id uuid)
RETURNS TABLE(counterpart_name text, counterpart_phone text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT s.full_name, s.phone
  FROM public.roomie_matches m
  JOIN public.roomie_seekers s ON s.id = m.seeker_id
  WHERE m.listing_id = p_listing_id
    AND m.seeker_id = p_seeker_id
    AND m.owner_id = auth.uid();
$function$;