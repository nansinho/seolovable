import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Security logging for user lookups
const logSecurityEvent = (event: string, details: Record<string, unknown>) => {
  console.log(`[SECURITY] ${event}`, {
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Plans configuration - must match database constraint: free, starter, pro, business
const PRODUCT_TO_PLAN: Record<string, { planType: string; sitesLimit: number }> = {
  "prod_TdhuLMAF5eXcjT": { planType: "starter", sitesLimit: 1 },
  "prod_Tdhvh9CaIxk6w0": { planType: "pro", sitesLimit: 5 },
  "prod_TdhvfNh0QiimbU": { planType: "business", sitesLimit: 999 }
};

// Fallback function to determine plan type from valid values
const getValidPlanType = (productId: string): { planType: string; sitesLimit: number } => {
  const plan = PRODUCT_TO_PLAN[productId];
  if (plan) return plan;
  return { planType: "starter", sitesLimit: 1 };
};

// Helper function to find user by stripe_customer_id first, then email as fallback
const findUserByCustomer = async (
  supabase: any,
  customerId: string,
  customerEmail: string | null
): Promise<string | null> => {
  // Try to find user by stripe_customer_id first (preferred - no email enumeration risk)
  const { data: planData } = await supabase
    .from("user_plans")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .limit(1);

  if (planData && planData.length > 0) {
    logSecurityEvent("user_lookup_by_customer_id", { customer_id: customerId, found: true });
    return (planData[0] as { user_id: string }).user_id;
  }

  // Fallback to email lookup for new customers
  if (customerEmail) {
    logSecurityEvent("user_lookup_by_email", { customer_id: customerId, has_email: true });
    
    const { data: users } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", customerEmail)
      .limit(1);

    if (users && users.length > 0) {
      return (users[0] as { id: string }).id;
    }
  }

  logSecurityEvent("user_lookup_failed", { customer_id: customerId });
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    // SECURITY: Require webhook signature verification
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      throw new Error("STRIPE_WEBHOOK_SECRET must be configured for security");
    }

    if (!sig) {
      logStep("ERROR: Missing stripe-signature header");
      throw new Error("Missing stripe-signature header");
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logStep("Webhook signature verified");

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = session.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          
          const userId = await findUserByCustomer(supabase, customerId, customer.email);

          if (userId) {
            const productId = subscription.items.data[0].price.product as string;
            const planInfo = getValidPlanType(productId);

            const { error } = await supabase
              .from("user_plans")
              .upsert({
                user_id: userId,
                plan_type: planInfo.planType,
                sites_limit: planInfo.sitesLimit,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: subscription.items.data[0].price.id,
                subscription_status: "active",
                updated_at: new Date().toISOString()
              }, { onConflict: "user_id" });

            if (error) {
              logStep("Error updating user plan", { error: error.message });
            } else {
              logStep("User plan updated", { userId, planType: planInfo.planType });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

        const userId = await findUserByCustomer(supabase, customerId, customer.email);

        if (userId) {
          const productId = subscription.items.data[0].price.product as string;
          const planInfo = getValidPlanType(productId);

          await supabase
            .from("user_plans")
            .upsert({
              user_id: userId,
              plan_type: planInfo.planType,
              sites_limit: planInfo.sitesLimit,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id" });

          logStep("Subscription status updated", { userId, status: subscription.status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

        const userId = await findUserByCustomer(supabase, customerId, customer.email);

        if (userId) {
          await supabase
            .from("user_plans")
            .update({
              plan_type: "free",
              sites_limit: 1,
              subscription_status: "canceled",
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);

          logStep("User downgraded to free plan", { userId });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
