-- Add txt_record_token column for TXT-based DNS verification
ALTER TABLE public.sites ADD COLUMN txt_record_token text;

-- Add index for faster lookups
CREATE INDEX idx_sites_txt_record_token ON public.sites(txt_record_token);