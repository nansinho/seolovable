-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Update sites RLS to allow admins to see all sites
DROP POLICY IF EXISTS "Users can view their own sites" ON public.sites;
CREATE POLICY "Users can view their own sites or admins can view all"
ON public.sites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own sites" ON public.sites;
CREATE POLICY "Users can update their own sites or admins can update all"
ON public.sites
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own sites" ON public.sites;
CREATE POLICY "Users can delete their own sites or admins can delete all"
ON public.sites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Admins can insert sites for any user
DROP POLICY IF EXISTS "Users can create their own sites" ON public.sites;
CREATE POLICY "Users can create sites or admins can create for anyone"
ON public.sites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Update bot_activity RLS for admins
DROP POLICY IF EXISTS "Users can view their own bot activity" ON public.bot_activity;
CREATE POLICY "Users can view their own bot activity or admins can view all"
ON public.bot_activity
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Update daily_stats RLS for admins
DROP POLICY IF EXISTS "Users can view their own stats" ON public.daily_stats;
CREATE POLICY "Users can view their own stats or admins can view all"
ON public.daily_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());