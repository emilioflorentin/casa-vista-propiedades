-- Create table for property floor plans
CREATE TABLE public.property_floor_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  user_id UUID NOT NULL,
  floor_plan_data JSONB, -- Store the floor plan drawing data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_floor_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for floor plans
CREATE POLICY "Users can view their own floor plans" 
ON public.property_floor_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own floor plans" 
ON public.property_floor_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own floor plans" 
ON public.property_floor_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own floor plans" 
ON public.property_floor_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for room assignments
CREATE TABLE public.room_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  floor_plan_id UUID NOT NULL REFERENCES public.property_floor_plans(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL, -- Identifier for the room in the floor plan
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  rent_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for room assignments
CREATE POLICY "Users can view room assignments for their floor plans" 
ON public.room_assignments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.property_floor_plans 
  WHERE id = room_assignments.floor_plan_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can create room assignments for their floor plans" 
ON public.room_assignments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.property_floor_plans 
  WHERE id = room_assignments.floor_plan_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update room assignments for their floor plans" 
ON public.room_assignments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.property_floor_plans 
  WHERE id = room_assignments.floor_plan_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can delete room assignments for their floor plans" 
ON public.room_assignments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.property_floor_plans 
  WHERE id = room_assignments.floor_plan_id 
  AND user_id = auth.uid()
));

-- Add trigger for updating updated_at columns
CREATE TRIGGER update_property_floor_plans_updated_at
BEFORE UPDATE ON public.property_floor_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_assignments_updated_at
BEFORE UPDATE ON public.room_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();