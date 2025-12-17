-- Add new columns to room_assignments table
ALTER TABLE public.room_assignments 
ADD COLUMN IF NOT EXISTS property_id uuid,
ADD COLUMN IF NOT EXISTS room_name text,
ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'bedroom',
ADD COLUMN IF NOT EXISTS room_size numeric;

-- Make floor_plan_id nullable since we're moving away from floor plan dependency
ALTER TABLE public.room_assignments 
ALTER COLUMN floor_plan_id DROP NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_room_assignments_property_id ON public.room_assignments(property_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view room assignments for their floor plans" ON public.room_assignments;
DROP POLICY IF EXISTS "Users can create room assignments for their floor plans" ON public.room_assignments;
DROP POLICY IF EXISTS "Users can update room assignments for their floor plans" ON public.room_assignments;
DROP POLICY IF EXISTS "Users can delete room assignments for their floor plans" ON public.room_assignments;

-- Create new RLS policies based on property ownership
CREATE POLICY "Users can view their room assignments"
ON public.room_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = room_assignments.property_id 
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create room assignments for their properties"
ON public.room_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = room_assignments.property_id 
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their room assignments"
ON public.room_assignments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = room_assignments.property_id 
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their room assignments"
ON public.room_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = room_assignments.property_id 
    AND properties.user_id = auth.uid()
  )
);