-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  blocked_at timestamp with time zone NOT NULL DEFAULT now(),
  blocked_by uuid NOT NULL,
  reason text
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view blocked users
CREATE POLICY "Admins can view blocked users"
ON public.blocked_users
FOR SELECT
USING (is_admin());

-- Only admins can block users
CREATE POLICY "Admins can block users"
ON public.blocked_users
FOR INSERT
WITH CHECK (is_admin());

-- Only admins can unblock users
CREATE POLICY "Admins can unblock users"
ON public.blocked_users
FOR DELETE
USING (is_admin());