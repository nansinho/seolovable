-- Add INSERT policies for profiles table for defense in depth

-- Allow users to create their own profile once (fallback if trigger fails)
CREATE POLICY "Users can create their own profile once"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- Allow admins to insert any profile
CREATE POLICY "Admins can insert any profile"
ON public.profiles
FOR INSERT
WITH CHECK (is_admin());