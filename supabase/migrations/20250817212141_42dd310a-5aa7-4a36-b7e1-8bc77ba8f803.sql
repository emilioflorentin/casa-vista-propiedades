-- Create a policy to allow viewing public profile information for property owners
CREATE POLICY "Property owner profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT user_id 
    FROM public.properties
  )
);