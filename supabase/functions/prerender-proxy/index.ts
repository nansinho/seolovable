import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-agent, x-original-user-agent, x-forwarded-host',
};

const PRERENDER_SERVICE_URL = "https://prerender.seolovable.cloud";

// Common bot patterns
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /gptbot/i,
  /chatgpt/i,
  /claude/i,
  /anthropic/i,
  /petalbot/i,
  /bytespider/i,
];

function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function logStep(step: string, details?: unknown) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRERENDER-PROXY] ${step}${detailsStr}`);
}

async function logCrawl(supabaseUrl: string, supabaseKey: string, siteId: string, domain: string, url: string, userAgent: string, cached: boolean) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the site's prerender_token
    const { data: site } = await supabase
      .from('sites')
      .select('prerender_token')
      .eq('id', siteId)
      .single();

    if (!site) return;

    await supabase.from('prerender_logs').insert({
      site_id: siteId,
      token: site.prerender_token,
      domain,
      url,
      user_agent: userAgent,
      cached,
      source: 'cname_proxy',
    });

    // Update site stats
    await supabase.rpc('increment_pages_rendered', { site_id_param: siteId });

    logStep('Crawl logged', { siteId, domain });
  } catch (error) {
    console.error('[PRERENDER-PROXY] Error logging crawl:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const requestUrl = new URL(req.url);
    
    // Mode 1: Query parameter (for testing/direct calls)
    let targetUrl = requestUrl.searchParams.get('url');
    
    // Mode 2: CNAME proxy - detect domain from Host header
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host');
    
    const userAgent = req.headers.get('x-original-user-agent') ||
                      req.headers.get('user-agent') || 
                      'Unknown';

    logStep('Received request', { 
      targetUrl, 
      hostHeader,
      userAgent: userAgent.substring(0, 100),
      method: req.method,
      path: requestUrl.pathname,
    });

    // CNAME proxy mode: look up origin from database
    if (!targetUrl && hostHeader) {
      // Extract the domain from host header (remove port if present)
      const domain = hostHeader.split(':')[0].toLowerCase();
      
      logStep('CNAME mode - looking up domain', { domain });

      // Find site by URL domain
      const { data: site, error: siteError } = await supabaseClient
        .from('sites')
        .select('id, origin_url, url, status, dns_verified')
        .or(`url.ilike.%${domain}%`)
        .maybeSingle();

      if (siteError) {
        logStep('Database error', { error: siteError.message });
        return new Response(
          JSON.stringify({ error: 'Database error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!site) {
        logStep('Site not found', { domain });
        return new Response(
          JSON.stringify({ error: 'Site not configured', domain }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!site.origin_url) {
        logStep('No origin URL configured', { siteId: site.id });
        return new Response(
          JSON.stringify({ error: 'Origin URL not configured for this site' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Construct target URL with original path
      const originBase = site.origin_url.replace(/\/$/, '');
      const path = requestUrl.pathname + requestUrl.search;
      targetUrl = `${originBase}${path}`;

      logStep('Resolved origin', { 
        siteId: site.id, 
        originUrl: site.origin_url, 
        targetUrl 
      });

      // Check if this is a bot
      if (isBot(userAgent)) {
        logStep('Bot detected, prerendering', { userAgent: userAgent.substring(0, 50) });

        // Fetch prerendered content
        const prerenderUrl = `${PRERENDER_SERVICE_URL}/${targetUrl}`;
        const prerenderResponse = await fetch(prerenderUrl, {
          method: 'GET',
          headers: { 'User-Agent': userAgent },
        });

        if (prerenderResponse.ok) {
          const html = await prerenderResponse.text();
          
          // Log the crawl in background
          logCrawl(supabaseUrl, supabaseServiceKey, site.id, domain, targetUrl, userAgent, false).catch(console.error);

          return new Response(html, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/html; charset=utf-8',
              'X-Prerender-Status': 'rendered',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        } else {
          logStep('Prerender failed, falling back to origin', { status: prerenderResponse.status });
        }
      }

      // Not a bot OR prerender failed: proxy to origin
      logStep('Proxying to origin', { targetUrl });
      
      const originResponse = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'User-Agent': userAgent,
          'Accept': req.headers.get('accept') || '*/*',
          'Accept-Language': req.headers.get('accept-language') || 'en',
        },
      });

      const body = await originResponse.arrayBuffer();
      
      return new Response(body, {
        status: originResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': originResponse.headers.get('content-type') || 'text/html',
          'X-Prerender-Status': 'passthrough',
        },
      });
    }

    // Direct mode with ?url= parameter (legacy/testing)
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter or invalid host' }),
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

    // Call prerender service directly
    const prerenderUrl = `${PRERENDER_SERVICE_URL}/${targetUrl}`;
    logStep('Direct prerender call', { prerenderUrl });

    const prerenderResponse = await fetch(prerenderUrl, {
      method: 'GET',
      headers: { 'User-Agent': userAgent },
    });

    if (!prerenderResponse.ok) {
      logStep('Prerender service error', { status: prerenderResponse.status });
      return new Response(
        JSON.stringify({ error: 'Prerender service failed', status: prerenderResponse.status }),
        { status: prerenderResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await prerenderResponse.text();
    logStep('Prerender success', { htmlLength: html.length });

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerender-Status': 'rendered',
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error) {
    console.error('[PRERENDER-PROXY] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
