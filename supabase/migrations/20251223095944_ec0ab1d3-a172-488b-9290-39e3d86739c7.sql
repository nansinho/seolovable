-- 1. Ajouter la colonne source à prerender_logs
ALTER TABLE public.prerender_logs 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'prerender';

-- 2. Nettoyer toutes les données de test
TRUNCATE TABLE public.prerender_logs;
TRUNCATE TABLE public.bot_activity;
TRUNCATE TABLE public.daily_stats;

-- 3. Remettre les compteurs sites à zéro
UPDATE public.sites 
SET pages_rendered = 0, 
    last_crawl = NULL;