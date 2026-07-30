-- ============ LISTINGS ============
CREATE TABLE public.roomie_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,

  -- vivienda
  title text NOT NULL,
  address text NOT NULL,
  municipality text NOT NULL,
  province text NOT NULL,
  property_type text NOT NULL DEFAULT 'apartment',
  total_rooms integer NOT NULL DEFAULT 1,
  bathrooms integer NOT NULL DEFAULT 1,
  total_area numeric NOT NULL DEFAULT 0,
  home_images text[] NOT NULL DEFAULT '{}',

  -- habitación
  room_area numeric NOT NULL DEFAULT 0,
  room_private_bath boolean NOT NULL DEFAULT false,
  room_furnished boolean NOT NULL DEFAULT true,
  room_exterior boolean NOT NULL DEFAULT true,
  room_images text[] NOT NULL DEFAULT '{}',
  available_from date NOT NULL DEFAULT CURRENT_DATE,

  -- gastos
  rent_amount numeric NOT NULL DEFAULT 0,
  deposit_amount numeric NOT NULL DEFAULT 0,
  bills_included boolean NOT NULL DEFAULT false,
  includes_water boolean NOT NULL DEFAULT false,
  includes_electricity boolean NOT NULL DEFAULT false,
  includes_gas boolean NOT NULL DEFAULT false,
  includes_internet boolean NOT NULL DEFAULT false,
  includes_community boolean NOT NULL DEFAULT false,
  bills_estimate numeric NOT NULL DEFAULT 0,

  -- convivencia
  flatmates_count integer NOT NULL DEFAULT 1,
  flatmates_age_range text NOT NULL DEFAULT '',
  flatmates_gender_mix text NOT NULL DEFAULT 'mixed',
  flatmates_occupation text NOT NULL DEFAULT 'both',
  flatmates_schedule text NOT NULL DEFAULT 'mixed',
  social_level text NOT NULL DEFAULT 'balanced',
  smokers boolean NOT NULL DEFAULT false,
  has_pets boolean NOT NULL DEFAULT false,
  pets_allowed boolean NOT NULL DEFAULT false,
  cleanliness text NOT NULL DEFAULT 'normal',
  guests_policy text NOT NULL DEFAULT 'occasionally',
  languages text[] NOT NULL DEFAULT '{}',
  atmosphere text NOT NULL DEFAULT '',

  -- preferencias del compañero buscado
  pref_age_min integer,
  pref_age_max integer,
  pref_gender text DEFAULT 'any',
  pref_occupation text DEFAULT 'any',
  pref_smoker text DEFAULT 'any',
  pref_pets text DEFAULT 'any',
  pref_min_stay_months integer,

  contact_phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.roomie_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roomie_listings TO authenticated;
GRANT ALL ON public.roomie_listings TO service_role;

ALTER TABLE public.roomie_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active roomie listings are viewable by everyone"
ON public.roomie_listings FOR SELECT USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own roomie listings"
ON public.roomie_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roomie listings"
ON public.roomie_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roomie listings"
ON public.roomie_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_roomie_listings_updated_at
BEFORE UPDATE ON public.roomie_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEEKER PROFILES ============
CREATE TABLE public.roomie_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
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
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roomie_profiles TO authenticated;
GRANT ALL ON public.roomie_profiles TO service_role;

ALTER TABLE public.roomie_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roomie profile"
ON public.roomie_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roomie profile"
ON public.roomie_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roomie profile"
ON public.roomie_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roomie profile"
ON public.roomie_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_roomie_profiles_updated_at
BEFORE UPDATE ON public.roomie_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LIKES ============
CREATE TABLE public.roomie_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.roomie_listings(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  direction text NOT NULL CHECK (direction IN ('seeker','owner')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, seeker_id, direction)
);

GRANT SELECT, INSERT, DELETE ON public.roomie_likes TO authenticated;
GRANT ALL ON public.roomie_likes TO service_role;

ALTER TABLE public.roomie_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view roomie likes"
ON public.roomie_likes FOR SELECT TO authenticated
USING (auth.uid() = seeker_id OR auth.uid() = owner_id);

CREATE POLICY "Seekers can like listings"
ON public.roomie_likes FOR INSERT TO authenticated
WITH CHECK (
  (direction = 'seeker' AND auth.uid() = seeker_id)
  OR (direction = 'owner' AND auth.uid() = owner_id
      AND EXISTS (SELECT 1 FROM public.roomie_listings l WHERE l.id = listing_id AND l.user_id = auth.uid()))
);

CREATE POLICY "Participants can remove their roomie likes"
ON public.roomie_likes FOR DELETE TO authenticated
USING ((direction = 'seeker' AND auth.uid() = seeker_id) OR (direction = 'owner' AND auth.uid() = owner_id));

-- ============ MATCHES ============
CREATE TABLE public.roomie_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.roomie_listings(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, seeker_id)
);

GRANT SELECT, DELETE ON public.roomie_matches TO authenticated;
GRANT ALL ON public.roomie_matches TO service_role;

ALTER TABLE public.roomie_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their roomie matches"
ON public.roomie_matches FOR SELECT TO authenticated
USING (auth.uid() = seeker_id OR auth.uid() = owner_id);

CREATE POLICY "Participants can delete their roomie matches"
ON public.roomie_matches FOR DELETE TO authenticated
USING (auth.uid() = seeker_id OR auth.uid() = owner_id);

-- ============ MATCH TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_roomie_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.roomie_likes
    WHERE listing_id = NEW.listing_id
      AND seeker_id = NEW.seeker_id
      AND direction <> NEW.direction
  ) THEN
    INSERT INTO public.roomie_matches (listing_id, seeker_id, owner_id)
    VALUES (NEW.listing_id, NEW.seeker_id, NEW.owner_id)
    ON CONFLICT (listing_id, seeker_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER roomie_like_creates_match
AFTER INSERT ON public.roomie_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_roomie_like();

-- ============ SEEKER PROFILES VISIBLE TO OWNERS WHO RECEIVED A LIKE (no phone) ============
CREATE OR REPLACE FUNCTION public.get_roomie_applicants(p_listing_id uuid)
RETURNS TABLE(
  user_id uuid, full_name text, age integer, gender text, occupation text,
  schedule text, social_level text, smoker boolean, has_pets boolean,
  cleanliness text, languages text[], budget_max numeric, desired_area text,
  move_in_date date, bio text, avatar_url text, liked_at timestamptz, is_matched boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name, p.age, p.gender, p.occupation, p.schedule,
         p.social_level, p.smoker, p.has_pets, p.cleanliness, p.languages,
         p.budget_max, p.desired_area, p.move_in_date, p.bio, p.avatar_url,
         lk.created_at AS liked_at,
         EXISTS (SELECT 1 FROM public.roomie_matches m
                 WHERE m.listing_id = lk.listing_id AND m.seeker_id = lk.seeker_id) AS is_matched
  FROM public.roomie_likes lk
  JOIN public.roomie_profiles p ON p.user_id = lk.seeker_id
  WHERE lk.listing_id = p_listing_id
    AND lk.direction = 'seeker'
    AND EXISTS (SELECT 1 FROM public.roomie_listings l
                WHERE l.id = p_listing_id AND l.user_id = auth.uid())
  ORDER BY lk.created_at DESC;
$$;

-- ============ CONTACT PHONE ONLY WHEN MATCHED ============
CREATE OR REPLACE FUNCTION public.get_roomie_match_contact(p_listing_id uuid, p_seeker_id uuid)
RETURNS TABLE(counterpart_name text, counterpart_phone text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT m.owner_id INTO v_owner
  FROM public.roomie_matches m
  WHERE m.listing_id = p_listing_id AND m.seeker_id = p_seeker_id
    AND (m.owner_id = auth.uid() OR m.seeker_id = auth.uid());

  IF v_owner IS NULL THEN
    RETURN;
  END IF;

  IF auth.uid() = v_owner THEN
    RETURN QUERY
      SELECT p.full_name, p.phone FROM public.roomie_profiles p WHERE p.user_id = p_seeker_id;
  ELSE
    RETURN QUERY
      SELECT COALESCE(pr.full_name, l.title), l.contact_phone
      FROM public.roomie_listings l
      LEFT JOIN public.profiles pr ON pr.id = l.user_id
      WHERE l.id = p_listing_id;
  END IF;
END;
$$;