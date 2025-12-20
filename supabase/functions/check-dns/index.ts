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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error("Missing backend configuration");
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    logStep("Auth header received", {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.slice(0, 12) ?? null,
    });

    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    logStep("Token parsed", { tokenLength: token.length });
    if (!token) throw new Error("Empty token");

    // Create auth client WITH the user's token in global headers
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError) {
      logStep("AUTH ERROR", { message: userError.message });
      return new Response(
        JSON.stringify({
          success: false,
          error: `Authentication error: ${userError.message}`,
          hint: "Veuillez vous déconnecter puis vous reconnecter, puis réessayer.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { siteId } = await req.json();
    if (!siteId) throw new Error("Site ID is required");
    logStep("Checking DNS for site", { siteId });

    // Get site details
    const { data: site, error: siteError } = await supabaseAdmin
      .from("sites")
      .select("id, url, cname_target, txt_record_token, user_id, dns_verified")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      throw new Error("Site not found");
    }

    // Check user owns the site or is admin (use has_role with user_id since service_role has no auth context)
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    logStep("Authorization check", { siteUserId: site.user_id, currentUserId: user.id, isAdmin });
    
    if (site.user_id !== user.id && !isAdmin) {
      throw new Error("Not authorized to check this site");
    }

    // If no TXT token set, cannot verify
    if (!site.txt_record_token) {
      logStep("No TXT token configured");
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: "Aucun token TXT configuré pour ce site",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extraire le domaine depuis l'URL
    let domain = "";
    try {
      const urlObj = new URL(site.url);
      domain = urlObj.hostname;
    } catch {
      throw new Error("Invalid site URL");
    }

    // Certains registrars attendent _seolovable (et ajoutent automatiquement le domaine),
    // d'autres demandent _seolovable.<domaine>. On teste les deux.
    const candidates = [`_seolovable.${domain}`, `_seolovable`];
    logStep("Checking TXT record", { candidates, expectedToken: site.txt_record_token });

    let verified = false;
    let message = "";
    let matchedName: string | null = null;

    try {
      for (const name of candidates) {
        const dnsResponse = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`,
          { headers: { Accept: "application/dns-json" } }
        );

        const dnsData = await dnsResponse.json();
        logStep("DNS response received", { name, status: dnsData?.Status, answers: dnsData?.Answer?.length ?? 0 });

        if (dnsData.Answer && dnsData.Answer.length > 0) {
          const txtRecords = dnsData.Answer.filter((record: { type: number }) => record.type === 16);

          for (const record of txtRecords) {
            const recordData = String(record.data).replace(/^"|"$/g, "").trim();
            if (recordData === site.txt_record_token) {
              verified = true;
              matchedName = name;
              message = "TXT record vérifié avec succès";
              break;
            }
          }

          if (verified) break;

          if (!verified && txtRecords.length > 0 && !message) {
            message = `TXT record trouvé mais ne correspond pas. Attendu: ${site.txt_record_token}`;
          }
        }
      }

      if (!verified && !message) {
        message = `Aucun enregistrement TXT trouvé pour _seolovable (ou _seolovable.${domain})`;
      }
    } catch (dnsError) {
      logStep("DNS lookup error", { error: String(dnsError) });
      message = "Impossible de vérifier le DNS. Réessayez plus tard.";
    }

    // Update site if verified
    if (verified && !site.dns_verified) {
      const { error: updateError } = await supabaseAdmin
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
        txt_record_name: matchedName ?? candidates[0],
        tried: candidates,
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
