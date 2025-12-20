-- Phase 4: Ajouter les colonnes DNS pour la gestion des sites
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS cname_target TEXT,
ADD COLUMN IF NOT EXISTS dns_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dns_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS coolify_service_id TEXT;

-- Ajouter un index sur dns_verified pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_sites_dns_verified ON public.sites(dns_verified) WHERE dns_verified = false;