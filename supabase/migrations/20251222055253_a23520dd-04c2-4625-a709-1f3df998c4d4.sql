-- Ajouter prerender_token à la table sites
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS prerender_token TEXT UNIQUE;

-- Générer des tokens pour les sites existants qui n'en ont pas
UPDATE public.sites SET prerender_token = gen_random_uuid()::text WHERE prerender_token IS NULL;

-- Ajouter une contrainte NOT NULL après avoir rempli les valeurs existantes
ALTER TABLE public.sites ALTER COLUMN prerender_token SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.sites ALTER COLUMN prerender_token SET NOT NULL;

-- Ajouter site_id à prerender_logs
ALTER TABLE public.prerender_logs ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.sites(id);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_prerender_logs_site_id ON public.prerender_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_prerender_token ON public.sites(prerender_token);

-- RLS policy pour que les utilisateurs voient les logs de leurs sites
CREATE POLICY "Users can view logs for their sites"
ON public.prerender_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = prerender_logs.site_id 
    AND sites.user_id = auth.uid()
  )
  OR is_admin()
);