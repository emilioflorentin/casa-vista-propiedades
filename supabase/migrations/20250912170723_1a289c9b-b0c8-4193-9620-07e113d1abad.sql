-- Add foreign key constraint with CASCADE DELETE between properties and users
-- This ensures that when a user is deleted, all their properties are automatically deleted

ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;