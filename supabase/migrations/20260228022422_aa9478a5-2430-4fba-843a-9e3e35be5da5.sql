-- Create internal tasks table for multiservicios
CREATE TABLE public.internal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'in_progress',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

ALTER TABLE public.internal_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Multiservicios can view internal tasks"
  ON public.internal_tasks FOR SELECT
  USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can create internal tasks"
  ON public.internal_tasks FOR INSERT
  WITH CHECK (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can update internal tasks"
  ON public.internal_tasks FOR UPDATE
  USING (auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can delete internal tasks"
  ON public.internal_tasks FOR DELETE
  USING (auth.email() = 'multiservicios@nazarihomes.com');

-- Trigger for updated_at
CREATE TRIGGER update_internal_tasks_updated_at
  BEFORE UPDATE ON public.internal_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
