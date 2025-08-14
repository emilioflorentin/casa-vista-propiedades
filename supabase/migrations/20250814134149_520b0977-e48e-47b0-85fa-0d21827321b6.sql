-- Drop the existing public profile policy that allows everyone to see all data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Create a more restrictive policy - users can only see their own full profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a security definer function to get public profile info (safe data only)
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  user_type text,
  company_name text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.user_type,
    p.company_name
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;

-- Create a function to get contact info for property owners (only for their own properties)
CREATE OR REPLACE FUNCTION public.get_property_owner_contact(property_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  user_type text,
  company_name text,
  phone text,
  email text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.user_type,
    p.company_name,
    p.phone,
    p.email
  FROM public.profiles p
  JOIN public.properties prop ON prop.user_id = p.id
  WHERE prop.id = property_id;
$$;