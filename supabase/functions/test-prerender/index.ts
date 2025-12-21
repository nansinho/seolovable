import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, validateUrlSafe } from "../_shared/security.ts";

const PRERENDER_URL = "http://prerender.seolovable.cloud:3000";

// Decode HTML entities
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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

    // Validate URL with SSRF protection
    const urlValidation = validateUrlSafe(url);
    if (!urlValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: urlValidation.error || "Invalid URL format" }),
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
      title = decodeHtmlEntities(titleMatch[1].trim());
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    if (!descMatch) {
      const descMatch2 = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
      if (descMatch2) {
        description = decodeHtmlEntities(descMatch2[1].trim());
      }
    } else {
      description = decodeHtmlEntities(descMatch[1].trim());
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
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});
