-- Create function to get complete profile info for local properties, bypassing RLS
CREATE OR REPLACE FUNCTION public.get_complete_profile_info(profile_user_id uuid)
RETURNS TABLE(
  id uuid, 
  full_name text, 
  user_type text, 
  company_name text, 
  phone text, 
  email text, 
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.full_name,
    p.user_type,
    p.company_name,
    p.phone,
    p.email,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$function$;