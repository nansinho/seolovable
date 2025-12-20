-- Create sites table for user's websites
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'error')),
  pages_rendered INTEGER NOT NULL DEFAULT 0,
  last_crawl TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_activity table for tracking bot visits
CREATE TABLE public.bot_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bot_name TEXT NOT NULL,
  bot_type TEXT NOT NULL CHECK (bot_type IN ('search', 'ai')),
  pages_crawled INTEGER NOT NULL DEFAULT 0,
  crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_stats table for aggregated statistics
CREATE TABLE public.daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_pages_rendered INTEGER NOT NULL DEFAULT 0,
  total_bots INTEGER NOT NULL DEFAULT 0,
  google_crawls INTEGER NOT NULL DEFAULT 0,
  ai_crawls INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Sites policies
CREATE POLICY "Users can view their own sites" 
ON public.sites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sites" 
ON public.sites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" 
ON public.sites FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" 
ON public.sites FOR DELETE USING (auth.uid() = user_id);

-- Bot activity policies
CREATE POLICY "Users can view their own bot activity" 
ON public.bot_activity FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot activity" 
ON public.bot_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily stats policies
CREATE POLICY "Users can view their own stats" 
ON public.daily_stats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats" 
ON public.daily_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.daily_stats FOR UPDATE USING (auth.uid() = user_id);

-- Create function for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for sites table
CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();