import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, ALLOWED_ORIGINS } from "../_shared/security.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Plans configuration
const PLANS = {
  starter: {
    priceId: "price_1SgQV2KVQwNIgFQrudfBCa40",
    productId: "prod_TdhuLMAF5eXcjT",
    sitesLimit: 1,
    planType: "starter"
  },
  pro: {
    priceId: "price_1SgQVRKVQwNIgFQrBW5LjlIh",
    productId: "prod_Tdhvh9CaIxk6w0",
    sitesLimit: 5,
    planType: "pro"
  },
  business: {
    priceId: "price_1SgQVdKVQwNIgFQr8BjyVsph",
    productId: "prod_TdhvfNh0QiimbU",
    sitesLimit: 999,
    planType: "business"
  }
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { planId } = await req.json();
    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      throw new Error("Invalid plan ID");
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    logStep("Plan selected", { planId });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });

      // Check for existing active subscriptions and cancel them
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
      });

      if (existingSubscriptions.data.length > 0) {
        logStep("Found existing subscriptions to cancel", { 
          count: existingSubscriptions.data.length,
        });

        // Cancel all existing subscriptions
        for (const subscription of existingSubscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id, {
            prorate: true, // Prorate the cancellation
          });
          logStep("Cancelled subscription", { subscriptionId: subscription.id });
        }
      }
    }

    // Use allowed origin for redirect URLs
    const requestOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
      origin === allowed || origin.endsWith('.lovableproject.com')
    ) ? origin : ALLOWED_ORIGINS[0];
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${requestOrigin}/payment-success`,
      cancel_url: `${requestOrigin}/upgrade?payment=canceled`,
      metadata: {
        userId: user.id,
        planId: planId,
        planType: plan.planType,
        sitesLimit: plan.sitesLimit.toString()
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
