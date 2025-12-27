-- Fix search_path for increment_pages_rendered function
CREATE OR REPLACE FUNCTION public.increment_pages_rendered(site_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sites
  SET 
    pages_rendered = pages_rendered + 1,
    last_crawl = now()
  WHERE id = site_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;