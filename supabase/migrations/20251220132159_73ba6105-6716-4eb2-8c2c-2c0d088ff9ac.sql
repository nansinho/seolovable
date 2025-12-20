-- Create user_plans table
CREATE TABLE public.user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'unlimited')),
  sites_limit integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan
CREATE POLICY "Users can view their own plan"
ON public.user_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all plans
CREATE POLICY "Admins can view all plans"
ON public.user_plans
FOR SELECT
USING (is_admin());

-- Admins can create plans
CREATE POLICY "Admins can create plans"
ON public.user_plans
FOR INSERT
WITH CHECK (is_admin());

-- Admins can update plans
CREATE POLICY "Admins can update plans"
ON public.user_plans
FOR UPDATE
USING (is_admin());

-- Admins can delete plans
CREATE POLICY "Admins can delete plans"
ON public.user_plans
FOR DELETE
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();