
-- Create storage bucket for cost receipts/justifications
INSERT INTO storage.buckets (id, name, public) VALUES ('cost-receipts', 'cost-receipts', true);

-- Only multiservicios can upload/manage cost receipts
CREATE POLICY "Multiservicios can upload cost receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cost-receipts' AND auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can view cost receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'cost-receipts');

CREATE POLICY "Multiservicios can update cost receipts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cost-receipts' AND auth.email() = 'multiservicios@nazarihomes.com');

CREATE POLICY "Multiservicios can delete cost receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'cost-receipts' AND auth.email() = 'multiservicios@nazarihomes.com');

-- Add receipts column to incident_costs
ALTER TABLE public.incident_costs ADD COLUMN receipts text[] DEFAULT '{}';
