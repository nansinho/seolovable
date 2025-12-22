-- Add bot detection columns to prerender_logs
ALTER TABLE public.prerender_logs
ADD COLUMN IF NOT EXISTS bot_name text,
ADD COLUMN IF NOT EXISTS bot_type text,
ADD COLUMN IF NOT EXISTS render_time_ms integer;

-- Create index for bot_type filtering
CREATE INDEX IF NOT EXISTS idx_prerender_logs_bot_type ON public.prerender_logs(bot_type);
CREATE INDEX IF NOT EXISTS idx_prerender_logs_site_bot ON public.prerender_logs(site_id, bot_type);