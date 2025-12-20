-- Create a function to create a default free plan for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan_type, sites_limit, subscription_status)
  VALUES (NEW.id, 'free', 1, 'inactive')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create a free plan when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_plan();

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_plans_user_id_key' 
    AND conrelid = 'public.user_plans'::regclass
  ) THEN
    ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create the plan for existing user who doesn't have one
INSERT INTO public.user_plans (user_id, plan_type, sites_limit, subscription_status)
SELECT id, 'free', 1, 'inactive'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_plans)
ON CONFLICT (user_id) DO NOTHING;