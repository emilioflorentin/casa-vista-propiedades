-- 1. Add contact_phone column to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS contact_phone text;

-- 2. Drop the public profile viewing policy (security fix)
DROP POLICY IF EXISTS "Property owner profiles are publicly viewable " ON public.profiles;

-- 3. Now only the owner can see their own profile
-- The policy "Users can view their own profile" already exists and handles this