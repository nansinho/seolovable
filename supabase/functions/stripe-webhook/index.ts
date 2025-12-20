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

// Plans configuration
const PRODUCT_TO_PLAN: Record<string, { planType: string; sitesLimit: number }> = {
  "prod_TdhuLMAF5eXcjT": { planType: "starter", sitesLimit: 1 },
  "prod_Tdhvh9CaIxk6w0": { planType: "pro", sitesLimit: 5 },
  "prod_TdhvfNh0QiimbU": { planType: "business", sitesLimit: 999 }
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

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Webhook signature verified");
    } else {
      event = JSON.parse(body);
      logStep("Webhook without signature verification");
    }

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = session.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          
          // Get user by email
          const { data: users } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", customer.email)
            .limit(1);

          if (users && users.length > 0) {
            const userId = users[0].id;
            const productId = subscription.items.data[0].price.product as string;
            const planInfo = PRODUCT_TO_PLAN[productId] || { planType: "starter", sitesLimit: 1 };

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

        const { data: users } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .limit(1);

        if (users && users.length > 0) {
          const userId = users[0].id;
          const productId = subscription.items.data[0].price.product as string;
          const planInfo = PRODUCT_TO_PLAN[productId] || { planType: "starter", sitesLimit: 1 };

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

        const { data: users } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .limit(1);

        if (users && users.length > 0) {
          const userId = users[0].id;

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
