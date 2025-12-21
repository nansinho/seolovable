-- Create table for lead capture and rate limiting
CREATE TABLE public.landing_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  test_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_tests ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anonymous users (public form)
CREATE POLICY "Allow public inserts" ON public.landing_tests
  FOR INSERT WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read all tests" ON public.landing_tests
  FOR SELECT USING (public.is_admin());

-- Create index for rate limiting lookups
CREATE INDEX idx_landing_tests_ip_date ON public.landing_tests (ip_address, created_at);