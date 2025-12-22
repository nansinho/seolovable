-- Créer une fonction pour mettre à jour le compteur de pages du site
CREATE OR REPLACE FUNCTION public.update_site_pages_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mettre à jour le compteur du site
  UPDATE sites 
  SET pages_rendered = pages_rendered + 1,
      last_crawl = NEW.created_at
  WHERE id = NEW.site_id;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur prerender_logs
DROP TRIGGER IF EXISTS trigger_update_site_pages ON prerender_logs;
CREATE TRIGGER trigger_update_site_pages
  AFTER INSERT ON prerender_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_site_pages_count();