import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-agent',
};

const PRERENDER_SERVICE_URL = "https://prerender.seolovable.cloud";

function logStep(step: string, details?: unknown) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRERENDER-PROXY] ${step}${detailsStr}`);
}

async function callLogCrawl(url: string, userAgent: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[PRERENDER-PROXY] Missing Supabase credentials for log-crawl');
      return;
    }

    logStep('Calling log-crawl', { url, userAgent: userAgent.substring(0, 50) });

    const response = await fetch(`${supabaseUrl}/functions/v1/log-crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        url,
        userAgent,
        pagesCrawled: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PRERENDER-PROXY] log-crawl failed:', response.status, errorText);
    } else {
      const result = await response.json();
      logStep('log-crawl success', result);
    }
  } catch (error) {
    console.error('[PRERENDER-PROXY] Error calling log-crawl:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get URL from query parameter
    const requestUrl = new URL(req.url);
    const targetUrl = requestUrl.searchParams.get('url');
    
    // Get User-Agent from header or query param
    const userAgent = req.headers.get('user-agent') || 
                      req.headers.get('x-original-user-agent') ||
                      requestUrl.searchParams.get('ua') || 
                      'Unknown Bot';

    logStep('Received request', { 
      targetUrl, 
      userAgent: userAgent.substring(0, 100),
      method: req.method 
    });

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call prerender service
    const prerenderUrl = `${PRERENDER_SERVICE_URL}/${targetUrl}`;
    logStep('Calling prerender service', { prerenderUrl });

    const prerenderResponse = await fetch(prerenderUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!prerenderResponse.ok) {
      logStep('Prerender service error', { 
        status: prerenderResponse.status 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Prerender service failed', 
          status: prerenderResponse.status 
        }),
        { 
          status: prerenderResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const html = await prerenderResponse.text();
    logStep('Prerender success', { htmlLength: html.length });

    // Log the crawl in background (don't block response)
    callLogCrawl(targetUrl, userAgent).catch(err => {
      console.error('[PRERENDER-PROXY] Background log-crawl error:', err);
    });

    // Return the rendered HTML
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerender-Status': 'rendered',
        'Cache-Control': 'public, max-age=86400', // Cache for 24h
      },
    });

  } catch (error) {
    console.error('[PRERENDER-PROXY] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
