import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Prerender Proxy - Mode Test Manuel Uniquement
 * 
 * Cette Edge Function est utilisée uniquement pour tester le prerendering
 * via le dashboard (bouton "Test Prerender").
 * 
 * Le vrai prerendering automatique se fait via le service Docker 
 * déployé sur le VPS (prerender.seolovable.cloud).
 * 
 * Usage: ?url=https://example.com/page
 */

const PRERENDER_ENGINE_URL = Deno.env.get('PRERENDER_ENGINE_URL') || "https://prerender.seolovable.cloud";

function logStep(step: string, details?: unknown) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRERENDER-TEST] ${step}${detailsStr}`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const targetUrl = requestUrl.searchParams.get('url');

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing url parameter',
          usage: 'Add ?url=https://example.com/page to test prerendering',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Test prerender request', { targetUrl });

    // Call prerender engine
    const prerenderUrl = `${PRERENDER_ENGINE_URL}/${targetUrl}`;
    const startTime = Date.now();

    const prerenderResponse = await fetch(prerenderUrl, {
      method: 'GET',
      headers: { 
        'User-Agent': 'SEOLovable Test Bot (Googlebot simulator)',
      },
    });

    const renderTime = Date.now() - startTime;

    if (!prerenderResponse.ok) {
      logStep('Prerender engine error', { status: prerenderResponse.status });
      return new Response(
        JSON.stringify({ 
          error: 'Prerender engine failed', 
          status: prerenderResponse.status,
          engineUrl: PRERENDER_ENGINE_URL,
        }),
        { status: prerenderResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await prerenderResponse.text();
    logStep('Prerender success', { htmlLength: html.length, renderTime });

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerender-Status': 'rendered',
        'X-Render-Time': `${renderTime}ms`,
        'X-Engine-URL': PRERENDER_ENGINE_URL,
      },
    });

  } catch (error) {
    console.error('[PRERENDER-TEST] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
