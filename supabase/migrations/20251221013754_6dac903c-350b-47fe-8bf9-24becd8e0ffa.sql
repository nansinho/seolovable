-- Create translations table
CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  lang text NOT NULL,
  value text NOT NULL,
  is_auto boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT translations_key_lang_unique UNIQUE (key, lang)
);

-- Create indexes for performance
CREATE INDEX idx_translations_key ON public.translations(key);
CREATE INDEX idx_translations_lang ON public.translations(lang);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Public read access (translations are public)
CREATE POLICY "Anyone can read translations"
ON public.translations
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert translations"
ON public.translations
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update translations"
ON public.translations
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete translations"
ON public.translations
FOR DELETE
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();