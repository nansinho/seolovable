-- Drop the existing SELECT policy that only checks user_id
DROP POLICY IF EXISTS "Users can view their own bot activity or admins can view all" ON public.bot_activity;

-- Create a better policy that allows users to see bot_activity for sites they own
CREATE POLICY "Users can view bot activity for their sites or admins can view all" 
ON public.bot_activity 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = bot_activity.site_id 
    AND sites.user_id = auth.uid()
  ) 
  OR is_admin()
);

-- Also update the INSERT policy to ensure site ownership
DROP POLICY IF EXISTS "Users can create their own bot activity" ON public.bot_activity;

CREATE POLICY "Users can insert bot activity for their sites" 
ON public.bot_activity 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = bot_activity.site_id 
    AND sites.user_id = auth.uid()
  ) 
  OR is_admin()
);