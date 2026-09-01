import { supabase } from '@/integrations/supabase/client';

/**
 * Roomie Finder seekers do NOT have an account: they fill a basic form and are
 * identified by a private token stored on their device. All access goes through
 * SECURITY DEFINER RPCs, so the Roomie data stays independent from Nazarí Homes.
 */
const TOKEN_KEY = 'roomie_seeker_token';

export const getSeekerToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setSeekerToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
};

export const clearSeekerToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export interface SeekerForm {
  full_name: string;
  phone: string;
  age?: number | null;
  gender: string;
  occupation: string;
  schedule: string;
  social_level: string;
  smoker: boolean;
  has_pets: boolean;
  cleanliness: string;
  languages: string[];
  budget_max?: number | null;
  desired_area: string;
  move_in_date?: string | null;
  bio: string;
}

export const saveSeeker = async (form: SeekerForm): Promise<string> => {
  const { data, error } = await supabase.rpc('roomie_seeker_upsert', {
    p_token: getSeekerToken(),
    p_full_name: form.full_name,
    p_phone: form.phone,
    p_age: form.age ?? null,
    p_gender: form.gender,
    p_occupation: form.occupation,
    p_schedule: form.schedule,
    p_social_level: form.social_level,
    p_smoker: form.smoker,
    p_has_pets: form.has_pets,
    p_cleanliness: form.cleanliness,
    p_languages: form.languages,
    p_budget_max: form.budget_max ?? null,
    p_desired_area: form.desired_area,
    p_move_in_date: form.move_in_date || null,
    p_bio: form.bio,
  });
  if (error) throw error;
  const token = data as unknown as string;
  setSeekerToken(token);
  return token;
};

export const fetchSeeker = async () => {
  const token = getSeekerToken();
  if (!token) return null;
  const { data, error } = await supabase.rpc('roomie_seeker_get', { p_token: token });
  if (error) return null;
  return (data as SeekerForm[] | null)?.[0] || null;
};

export const fetchSeekerLikes = async () => {
  const token = getSeekerToken();
  if (!token) return [];
  const { data } = await supabase.rpc('roomie_seeker_likes', { p_token: token });
  return (data as { listing_id: string; is_matched: boolean }[]) || [];
};

export const seekerLike = async (listingId: string) => {
  const token = getSeekerToken();
  if (!token) throw new Error('missing-profile');
  const { error } = await supabase.rpc('roomie_seeker_like', {
    p_token: token,
    p_listing_id: listingId,
  });
  if (error) throw error;
};

export interface SeekerMatch {
  listing_id: string;
  title: string;
  municipality: string;
  rent_amount: number;
  image: string | null;
  owner_name: string;
  owner_phone: string | null;
  matched_at: string;
}

export const fetchSeekerMatches = async (): Promise<SeekerMatch[]> => {
  const token = getSeekerToken();
  if (!token) return [];
  const { data } = await supabase.rpc('roomie_seeker_matches', { p_token: token });
  return (data as SeekerMatch[]) || [];
};
