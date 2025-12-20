-- First, drop the old constraint
ALTER TABLE public.user_plans DROP CONSTRAINT IF EXISTS user_plans_plan_type_check;

-- Update any existing 'unlimited' values to 'business' 
UPDATE public.user_plans SET plan_type = 'business' WHERE plan_type = 'unlimited';

-- Add the new constraint with correct plan types
ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_plan_type_check 
CHECK (plan_type IN ('free', 'starter', 'pro', 'business'));