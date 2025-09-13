-- Add location column to profiles for storing user location
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location text;