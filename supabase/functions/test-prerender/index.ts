import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRERENDER_URL = "http://prerender.seolovable.cloud:3000";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Testing prerender for URL: ${url}`);
    const startTime = Date.now();

    // Call the prerender service
    const prerenderResponse = await fetch(`${PRERENDER_URL}/${url}`, {
      method: "GET",
      headers: {
        "User-Agent": "SEOLovable-Test/1.0",
      },
    });

    const renderTime = Date.now() - startTime;
    const html = await prerenderResponse.text();
    const status = prerenderResponse.status;

    // Extract metadata from HTML
    let title = "";
    let description = "";

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    if (!descMatch) {
      const descMatch2 = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
      if (descMatch2) {
        description = descMatch2[1].trim();
      }
    } else {
      description = descMatch[1].trim();
    }

    // Calculate size
    const sizeBytes = new TextEncoder().encode(html).length;
    const sizeKB = (sizeBytes / 1024).toFixed(1);

    console.log(`Prerender completed: ${status}, ${renderTime}ms, ${sizeKB}KB`);

    return new Response(
      JSON.stringify({
        success: status >= 200 && status < 400,
        html,
        status,
        renderTime,
        title,
        description,
        size: sizeKB,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Test prerender error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to test prerender",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
