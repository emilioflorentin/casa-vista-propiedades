-- Update existing profiles with their emails from auth.users
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users 
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL;