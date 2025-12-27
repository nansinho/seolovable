-- Add origin_url field to sites table for CNAME proxy architecture
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS origin_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.sites.origin_url IS 'Origin server URL where the actual site is hosted (for CNAME proxy mode)';