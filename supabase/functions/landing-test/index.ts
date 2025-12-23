import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, validateUrlSafe, validateEmail } from "../_shared/security.ts";

const RATE_LIMIT = 3; // Max tests per day per IP

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, url, website } = body; // 'website' is honeypot field

    // Honeypot detection - if 'website' field is filled, it's a bot
    if (website) {
      console.log("Honeypot triggered - bot detected");
      // Return fake success to not alert the bot
      return new Response(
        JSON.stringify({ 
          success: true, 
          result: { score: 85, needsPrerender: false },
          remainingTests: 2
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate inputs
    if (!email || !url) {
      return new Response(
        JSON.stringify({ success: false, error: "Email et URL requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email with enhanced checks
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: emailValidation.error || "Email invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Validate URL with SSRF protection
    const urlValidation = validateUrlSafe(formattedUrl);
    if (!urlValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: urlValidation.error || "URL invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip")
      || "unknown";

    console.log(`Landing test request from IP: ${ip.substring(0, 8)}***, url: ${formattedUrl}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit - count tests from this IP in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from("landing_tests")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", oneDayAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur serveur" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((count || 0) >= RATE_LIMIT) {
      console.log(`Rate limit exceeded for IP`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Limite atteinte. Créez un compte gratuit pour plus de tests.",
          rateLimited: true 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also check for same email used more than 5 times today (exponential limit)
    const { count: emailCount } = await supabase
      .from("landing_tests")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneDayAgo);

    if ((emailCount || 0) >= 5) {
      console.log(`Email limit exceeded`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Limite atteinte pour cette adresse email.",
          rateLimited: true 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Perform the prerender test
    console.log(`Testing URL: ${formattedUrl}`);
    
    const testStartTime = Date.now();
    let testResult: Record<string, unknown> = { success: false };

    try {
      // Simple fetch test to check if URL is accessible with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(formattedUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          "Connection": "keep-alive",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - testStartTime;
      const html = await response.text();
      
      // Basic SEO checks
      const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
      const hasMetaDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(html);
      const hasH1 = /<h1[^>]*>/i.test(html);
      const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
      const contentLength = html.length;
      const isJavaScriptHeavy = /<script[^>]*src=/gi.test(html) && contentLength < 5000;

      testResult = {
        success: response.ok,
        statusCode: response.status,
        responseTime,
        contentLength,
        seo: {
          hasTitle,
          hasMetaDescription,
          hasH1,
          hasCanonical,
        },
        needsPrerender: isJavaScriptHeavy || contentLength < 3000,
        score: (hasTitle ? 25 : 0) + (hasMetaDescription ? 25 : 0) + (hasH1 ? 25 : 0) + (hasCanonical ? 25 : 0),
      };

      console.log(`Test successful: score=${testResult.score}, responseTime=${responseTime}ms`);
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
      
      if (errorMessage.includes("abort") || errorMessage.includes("timeout")) {
        testResult = {
          success: false,
          error: "Le site met trop de temps à répondre (timeout 15s).",
        };
      } else if (errorMessage.includes("certificate") || errorMessage.includes("SSL")) {
        testResult = {
          success: false,
          error: "Erreur de certificat SSL. Vérifiez que le site est bien en HTTPS.",
        };
      } else {
        testResult = {
          success: false,
          error: "Impossible d'accéder au site. Vérifiez l'URL et réessayez.",
        };
      }
    }

    // Hash IP for privacy before storing
    const hashedIp = await hashIp(ip);

    // Save the test result with hashed IP
    const { error: insertError } = await supabase
      .from("landing_tests")
      .insert({
        email,
        url: formattedUrl,
        ip_address: hashedIp,
        test_result: testResult,
      });

    if (insertError) {
      console.error("Error saving test:", insertError);
      // Continue anyway, the test was successful
    }

    console.log(`Test completed for ${formattedUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: testResult,
        remainingTests: RATE_LIMIT - (count || 0) - 1,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in landing-test:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur serveur" }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});

// Hash IP address for privacy
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.substring(0, 16));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}
