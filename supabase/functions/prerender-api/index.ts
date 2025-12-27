import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bot patterns for detection
const BOT_PATTERNS = [
  { pattern: /googlebot/i, name: 'Googlebot', type: 'search_engine' },
  { pattern: /bingbot/i, name: 'Bingbot', type: 'search_engine' },
  { pattern: /slurp/i, name: 'Yahoo Slurp', type: 'search_engine' },
  { pattern: /duckduckbot/i, name: 'DuckDuckBot', type: 'search_engine' },
  { pattern: /baiduspider/i, name: 'Baiduspider', type: 'search_engine' },
  { pattern: /yandexbot/i, name: 'YandexBot', type: 'search_engine' },
  { pattern: /facebot|facebookexternalhit/i, name: 'Facebook', type: 'social' },
  { pattern: /twitterbot/i, name: 'Twitter', type: 'social' },
  { pattern: /linkedinbot/i, name: 'LinkedIn', type: 'social' },
  { pattern: /whatsapp/i, name: 'WhatsApp', type: 'social' },
  { pattern: /telegrambot/i, name: 'Telegram', type: 'social' },
  { pattern: /discordbot/i, name: 'Discord', type: 'social' },
  { pattern: /slackbot/i, name: 'Slack', type: 'social' },
  { pattern: /chatgpt|gptbot|oai-searchbot/i, name: 'ChatGPT/OpenAI', type: 'ai' },
  { pattern: /claude-web|anthropic/i, name: 'Claude/Anthropic', type: 'ai' },
  { pattern: /perplexitybot/i, name: 'Perplexity', type: 'ai' },
  { pattern: /gemini|google-extended/i, name: 'Gemini', type: 'ai' },
  { pattern: /cohere-ai/i, name: 'Cohere', type: 'ai' },
];

function detectBot(userAgent: string): { name: string; type: string } | null {
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(userAgent)) {
      return { name: bot.name, type: bot.type };
    }
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    console.log(`[PRERENDER-API] Action: ${action}`, JSON.stringify(params));

    // Action: lookup - Find site by domain
    if (action === 'lookup') {
      const { domain } = params;
      
      if (!domain) {
        return new Response(
          JSON.stringify({ error: 'Domain is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Search by URL containing the domain
      const { data: site, error } = await supabase
        .from('sites')
        .select('id, origin_url, prerender_token, status')
        .or(`url.ilike.%${domain}%,origin_url.ilike.%${domain}%`)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('[PRERENDER-API] Lookup error:', error);
        return new Response(
          JSON.stringify({ error: 'Database error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!site) {
        console.log(`[PRERENDER-API] No site found for domain: ${domain}`);
        return new Response(
          JSON.stringify({ found: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[PRERENDER-API] Site found: ${site.id}`);
      return new Response(
        JSON.stringify({
          found: true,
          site_id: site.id,
          origin_url: site.origin_url,
          prerender_token: site.prerender_token
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: log - Log a prerender crawl
    if (action === 'log') {
      const { site_id, domain, url, user_agent, render_time_ms, cached } = params;

      if (!site_id || !domain || !url || !user_agent) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Detect bot type
      const botInfo = detectBot(user_agent);

      // Get the prerender_token for this site
      const { data: site } = await supabase
        .from('sites')
        .select('prerender_token')
        .eq('id', site_id)
        .single();

      // Insert log
      const { error: logError } = await supabase
        .from('prerender_logs')
        .insert({
          site_id,
          domain,
          url,
          user_agent,
          render_time_ms: render_time_ms || null,
          cached: cached || false,
          bot_name: botInfo?.name || 'Unknown',
          bot_type: botInfo?.type || 'unknown',
          token: site?.prerender_token || 'unknown',
          source: 'prerender-vps'
        });

      if (logError) {
        console.error('[PRERENDER-API] Log insert error:', logError);
        return new Response(
          JSON.stringify({ error: 'Failed to insert log' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment pages_rendered counter
      const { error: updateError } = await supabase.rpc('increment_pages_rendered', {
        site_id_param: site_id
      });

      if (updateError) {
        console.error('[PRERENDER-API] Increment error:', updateError);
        // Don't fail the request for this
      }

      console.log(`[PRERENDER-API] Logged crawl for site ${site_id}: ${url}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PRERENDER-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
