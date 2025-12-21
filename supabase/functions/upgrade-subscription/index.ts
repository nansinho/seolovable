import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/security.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPGRADE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Plans configuration - same as create-checkout
const PLANS = {
  starter: {
    priceId: "price_1SgQV2KVQwNIgFQrudfBCa40",
    productId: "prod_TdhuLMAF5eXcjT",
    sitesLimit: 1,
    planType: "starter",
    amount: 2900, // 29€ in cents
    order: 1,
  },
  pro: {
    priceId: "price_1SgQVRKVQwNIgFQrBW5LjlIh",
    productId: "prod_Tdhvh9CaIxk6w0",
    sitesLimit: 5,
    planType: "pro",
    amount: 5900, // 59€ in cents
    order: 2,
  },
  business: {
    priceId: "price_1SgQVdKVQwNIgFQr8BjyVsph",
    productId: "prod_TdhvfNh0QiimbU",
    sitesLimit: 999,
    planType: "business",
    amount: 9900, // 99€ in cents
    order: 3,
  }
};

// Determine if this is an upgrade or downgrade
const isDowngrade = (currentPriceId: string, newPlanId: string): boolean => {
  const currentPlan = Object.entries(PLANS).find(([_, p]) => p.priceId === currentPriceId);
  const newPlan = PLANS[newPlanId as keyof typeof PLANS];
  if (!currentPlan || !newPlan) return false;
  return newPlan.order < currentPlan[1].order;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { planId, preview = false } = await req.json();
    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      throw new Error("Invalid plan ID");
    }

    const newPlan = PLANS[planId as keyof typeof PLANS];
    logStep("Plan selected", { planId, preview });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found - redirecting to checkout");
      return new Response(JSON.stringify({ 
        needsCheckout: true,
        message: "No existing subscription found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscription - redirecting to checkout");
      return new Response(JSON.stringify({ 
        needsCheckout: true,
        message: "No active subscription found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const subscriptionItem = subscription.items.data[0];
    const currentPriceId = subscriptionItem.price.id;
    
    logStep("Found active subscription", { 
      subscriptionId: subscription.id,
    });

    // Check if trying to switch to the same plan
    if (currentPriceId === newPlan.priceId) {
      throw new Error("You are already on this plan");
    }

    // If preview mode, return proration preview
    if (preview) {
      logStep("Creating proration preview");
      
      const prorationPreview = await stripe.invoices.createPreview({
        customer: customerId,
        subscription: subscription.id,
        subscription_items: [{
          id: subscriptionItem.id,
          price: newPlan.priceId,
        }],
        subscription_proration_behavior: "always_invoice",
      });

      // Find proration line items
      const prorationLines = prorationPreview.lines.data;
      let creditAmount = 0;
      let debitAmount = 0;

      for (const line of prorationLines) {
        if (line.amount < 0) {
          creditAmount += Math.abs(line.amount);
        } else if (line.proration) {
          debitAmount += line.amount;
        }
      }

      const amountDue = prorationPreview.amount_due;
      const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

      logStep("Proration preview calculated", { 
        amountDue: amountDue / 100,
      });

      return new Response(JSON.stringify({
        preview: true,
        credit: creditAmount, // Credit for remaining days on old plan (in cents)
        debit: debitAmount,   // Cost for remaining days on new plan (in cents)
        amountDue,            // Final amount to pay now (in cents)
        renewalDate,          // Date of next renewal (unchanged)
        currentPlan: Object.entries(PLANS).find(([_, p]) => p.priceId === currentPriceId)?.[0] || "unknown",
        newPlan: planId,
        currency: prorationPreview.currency,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Determine if this is an upgrade or downgrade
    const downgrade = isDowngrade(currentPriceId, planId);
    logStep(downgrade ? "Processing downgrade" : "Processing upgrade");
    
    // For downgrades: use create_prorations to apply credit to next invoice
    // For upgrades: use always_invoice to charge immediately
    const prorationBehavior = downgrade ? "create_prorations" : "always_invoice";
    
    logStep("Updating subscription with proration", { prorationBehavior });
    
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscriptionItem.id,
        price: newPlan.priceId,
      }],
      proration_behavior: prorationBehavior,
      metadata: {
        planType: newPlan.planType,
        sitesLimit: newPlan.sitesLimit.toString(),
        changedAt: new Date().toISOString(),
        changeType: downgrade ? "downgrade" : "upgrade",
      }
    });

    logStep("Subscription updated successfully", { 
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      changeType: downgrade ? "downgrade" : "upgrade"
    });

    // Update user_plans in Supabase
    const { error: updateError } = await supabaseClient
      .from("user_plans")
      .update({
        plan_type: newPlan.planType,
        sites_limit: newPlan.sitesLimit,
        stripe_price_id: newPlan.priceId,
        subscription_status: updatedSubscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Warning: Failed to update user_plans", { error: updateError.message });
    } else {
      logStep("User plan updated in database");
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription upgraded successfully",
      newPlan: planId,
      renewalDate: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
    }), {
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
