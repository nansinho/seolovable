import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-INVOICES] ${step}${detailsStr}`);
};

serve(async (req) => {
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        invoices: [],
        subscription: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Get active subscription details
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let subscriptionData = null;
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];

      const toIso = (unixSeconds: unknown, label: string) => {
        try {
          if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) return null;
          return new Date(unixSeconds * 1000).toISOString();
        } catch (e) {
          logStep("Error parsing subscription date", {
            label,
            subscriptionId: subscription.id,
            value: unixSeconds,
          });
          return null;
        }
      };

      subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: toIso(subscription.current_period_start, "current_period_start") || new Date().toISOString(),
        currentPeriodEnd: toIso(subscription.current_period_end, "current_period_end") || new Date().toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: toIso(subscription.cancel_at, "cancel_at"),
        createdAt: toIso(subscription.created, "created") || new Date().toISOString(),
        priceId: subscription.items.data[0]?.price.id,
        productId: subscription.items.data[0]?.price.product,
      };
      logStep("Found active subscription", { subscriptionId: subscription.id });
    }

    // Get invoices (last 12)
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 12,
    });

    const formattedInvoices = invoices.data.map((invoice: Stripe.Invoice) => {
      // Safely handle date conversions
      let createdAt = null;
      let paidAt = null;
      
      try {
        if (invoice.created && typeof invoice.created === 'number') {
          createdAt = new Date(invoice.created * 1000).toISOString();
        }
      } catch (e) {
        logStep("Error parsing invoice created date", { invoiceId: invoice.id });
      }
      
      try {
        if (invoice.status_transitions?.paid_at && typeof invoice.status_transitions.paid_at === 'number') {
          paidAt = new Date(invoice.status_transitions.paid_at * 1000).toISOString();
        }
      } catch (e) {
        logStep("Error parsing invoice paid_at date", { invoiceId: invoice.id });
      }
      
      return {
        id: invoice.id,
        number: invoice.number,
        amountDue: invoice.amount_due || 0,
        amountPaid: invoice.amount_paid || 0,
        currency: invoice.currency || 'eur',
        status: invoice.status,
        createdAt: createdAt || new Date().toISOString(),
        paidAt,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
        description: invoice.lines.data?.[0]?.description || "Abonnement",
      };
    });

    logStep("Retrieved invoices", { count: formattedInvoices.length });

    // Get upcoming invoice if subscription exists
    let upcomingInvoice = null;
    if (subscriptionData) {
      try {
        const upcoming = await stripe.invoices.retrieveUpcoming({
          customer: customerId,
        });
        
        let periodStart = null;
        let periodEnd = null;
        
        try {
          if (upcoming.period_start && typeof upcoming.period_start === 'number') {
            periodStart = new Date(upcoming.period_start * 1000).toISOString();
          }
          if (upcoming.period_end && typeof upcoming.period_end === 'number') {
            periodEnd = new Date(upcoming.period_end * 1000).toISOString();
          }
        } catch (e) {
          logStep("Error parsing upcoming invoice dates");
        }
        
        upcomingInvoice = {
          amountDue: upcoming.amount_due || 0,
          currency: upcoming.currency || 'eur',
          periodStart: periodStart || subscriptionData.currentPeriodEnd,
          periodEnd: periodEnd || subscriptionData.currentPeriodEnd,
        };
        logStep("Retrieved upcoming invoice", { amountDue: upcoming.amount_due });
      } catch (e) {
        logStep("No upcoming invoice", { error: e instanceof Error ? e.message : String(e) });
      }
    }

    return new Response(JSON.stringify({
      invoices: formattedInvoices,
      subscription: subscriptionData,
      upcomingInvoice,
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
