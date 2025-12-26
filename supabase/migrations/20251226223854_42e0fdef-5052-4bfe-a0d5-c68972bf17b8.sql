-- Add energy certificate columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS energy_consumption_rating TEXT CHECK (energy_consumption_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
ADD COLUMN IF NOT EXISTS energy_consumption_value INTEGER,
ADD COLUMN IF NOT EXISTS energy_emissions_rating TEXT CHECK (energy_emissions_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
ADD COLUMN IF NOT EXISTS energy_emissions_value INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN public.properties.energy_consumption_rating IS 'Energy consumption rating from A to G';
COMMENT ON COLUMN public.properties.energy_consumption_value IS 'Energy consumption value in kWh/m² year';
COMMENT ON COLUMN public.properties.energy_emissions_rating IS 'CO2 emissions rating from A to G';
COMMENT ON COLUMN public.properties.energy_emissions_value IS 'CO2 emissions value in kg CO2/m² year';