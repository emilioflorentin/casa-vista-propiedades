-- Add email field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Update the handle_new_user function to also store the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, user_type, company_name, phone, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'phone',
    new.email
  );
  RETURN new;
END;
$$;