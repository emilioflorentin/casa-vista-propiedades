-- Create a function to update user profile with email
CREATE OR REPLACE FUNCTION public.update_profile_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    current_user_id uuid;
    current_user_email text;
BEGIN
    -- Get current user from auth context
    current_user_id := auth.uid();
    
    -- Get user email from auth.email()
    current_user_email := auth.email();
    
    -- Update the profile if user is authenticated and email exists
    IF current_user_id IS NOT NULL AND current_user_email IS NOT NULL THEN
        UPDATE public.profiles 
        SET email = current_user_email
        WHERE id = current_user_id AND email IS NULL;
    END IF;
END;
$$;