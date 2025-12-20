-- Add Stripe columns to user_plans table
ALTER TABLE public.user_plans 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_price_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_customer ON public.user_plans(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_subscription ON public.user_plans(stripe_subscription_id);