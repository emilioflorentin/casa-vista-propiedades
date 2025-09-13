-- Add rented status field to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_rented boolean NOT NULL DEFAULT false;