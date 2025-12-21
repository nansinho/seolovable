import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 3; // Max tests per day per IP

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, url } = await req.json();

    // Validate inputs
    if (!email || !url) {
      return new Response(
        JSON.stringify({ success: false, error: "Email et URL requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Email invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Validate URL
    try {
      new URL(formattedUrl);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "URL invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip")
      || "unknown";

    console.log(`Landing test request from IP: ${ip}, email: ${email}, url: ${formattedUrl}`);

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
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Limite atteinte. Créez un compte gratuit pour plus de tests.",
          rateLimited: true 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Perform the prerender test
    console.log(`Testing URL: ${formattedUrl}`);
    
    const testStartTime = Date.now();
    let testResult: any = { success: false };

    try {
      // Simple fetch test to check if URL is accessible
      const response = await fetch(formattedUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
          "Accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });

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
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      testResult = {
        success: false,
        error: "Impossible d'accéder au site. Vérifiez l'URL.",
      };
    }

    // Save the test result and capture the lead
    const { error: insertError } = await supabase
      .from("landing_tests")
      .insert({
        email,
        url: formattedUrl,
        ip_address: ip,
        test_result: testResult,
      });

    if (insertError) {
      console.error("Error saving test:", insertError);
      // Continue anyway, the test was successful
    }

    console.log(`Test completed for ${formattedUrl}:`, testResult);

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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});