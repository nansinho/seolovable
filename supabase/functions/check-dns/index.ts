import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-DNS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { siteId } = await req.json();
    if (!siteId) throw new Error("Site ID is required");
    logStep("Checking DNS for site", { siteId });

    // Get site details
    const { data: site, error: siteError } = await supabaseClient
      .from("sites")
      .select("id, url, cname_target, user_id, dns_verified")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      throw new Error("Site not found");
    }

    // Check user owns the site or is admin
    const { data: isAdmin } = await supabaseClient.rpc("is_admin");
    if (site.user_id !== user.id && !isAdmin) {
      throw new Error("Not authorized to check this site");
    }

    // If no CNAME target set, cannot verify
    if (!site.cname_target) {
      logStep("No CNAME target configured");
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: "Aucun CNAME configuré pour ce site",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract domain from URL
    let domain = "";
    try {
      const urlObj = new URL(site.url);
      domain = urlObj.hostname;
    } catch {
      throw new Error("Invalid site URL");
    }
    logStep("Checking DNS for domain", { domain, expectedCname: site.cname_target });

    // Try to resolve CNAME using DNS over HTTPS (Cloudflare)
    let verified = false;
    let message = "";

    try {
      const dnsResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME`,
        {
          headers: { Accept: "application/dns-json" },
        }
      );

      const dnsData = await dnsResponse.json();
      logStep("DNS response received", dnsData);

      if (dnsData.Answer && dnsData.Answer.length > 0) {
        // Check if any CNAME record matches our target
        const cnameRecords = dnsData.Answer.filter(
          (record: { type: number }) => record.type === 5
        );
        
        for (const record of cnameRecords) {
          const recordData = record.data.replace(/\.$/, ""); // Remove trailing dot
          const targetWithoutDot = site.cname_target.replace(/\.$/, "");
          
          if (recordData.toLowerCase() === targetWithoutDot.toLowerCase()) {
            verified = true;
            message = "CNAME vérifié avec succès";
            break;
          }
        }

        if (!verified && cnameRecords.length > 0) {
          message = `CNAME trouvé mais ne correspond pas. Attendu: ${site.cname_target}`;
        }
      }

      if (!verified && !message) {
        message = "Aucun enregistrement CNAME trouvé pour ce domaine";
      }
    } catch (dnsError) {
      logStep("DNS lookup error", { error: String(dnsError) });
      message = "Impossible de vérifier le DNS. Réessayez plus tard.";
    }

    // Update site if verified
    if (verified && !site.dns_verified) {
      const { error: updateError } = await supabaseClient
        .from("sites")
        .update({
          dns_verified: true,
          dns_verified_at: new Date().toISOString(),
          status: "active",
        })
        .eq("id", siteId);

      if (updateError) {
        logStep("Error updating site", { error: updateError.message });
      } else {
        logStep("Site updated to verified");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        message,
        domain,
        cname_target: site.cname_target,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
