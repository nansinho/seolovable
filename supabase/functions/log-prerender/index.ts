import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function logStep(step: string, details?: unknown) {
  console.log(`[log-prerender] ${step}`, details ? JSON.stringify(details) : '')
}

// Bot detection configuration
const BOT_PATTERNS: { pattern: RegExp; name: string; type: 'search' | 'ai' | 'social' | 'other' }[] = [
  // Search Engine Bots
  { pattern: /googlebot/i, name: 'Googlebot', type: 'search' },
  { pattern: /bingbot/i, name: 'Bingbot', type: 'search' },
  { pattern: /yandexbot/i, name: 'Yandex', type: 'search' },
  { pattern: /baiduspider/i, name: 'Baidu', type: 'search' },
  { pattern: /duckduckbot/i, name: 'DuckDuckGo', type: 'search' },
  { pattern: /applebot/i, name: 'Applebot', type: 'search' },
  { pattern: /slurp/i, name: 'Yahoo', type: 'search' },
  
  // AI Bots
  { pattern: /gptbot/i, name: 'GPTBot', type: 'ai' },
  { pattern: /chatgpt-user/i, name: 'ChatGPT', type: 'ai' },
  { pattern: /claude-web/i, name: 'Claude', type: 'ai' },
  { pattern: /anthropic-ai/i, name: 'Anthropic', type: 'ai' },
  { pattern: /cohere-ai/i, name: 'Cohere', type: 'ai' },
  { pattern: /bytespider/i, name: 'ByteDance', type: 'ai' },
  { pattern: /perplexitybot/i, name: 'Perplexity', type: 'ai' },
  { pattern: /ccbot/i, name: 'Common Crawl', type: 'ai' },
  
  // Social Media Bots
  { pattern: /facebookexternalhit/i, name: 'Facebook', type: 'social' },
  { pattern: /twitterbot/i, name: 'Twitter', type: 'social' },
  { pattern: /linkedinbot/i, name: 'LinkedIn', type: 'social' },
  { pattern: /whatsapp/i, name: 'WhatsApp', type: 'social' },
  { pattern: /telegrambot/i, name: 'Telegram', type: 'social' },
  { pattern: /slackbot/i, name: 'Slack', type: 'social' },
  { pattern: /discordbot/i, name: 'Discord', type: 'social' },
  { pattern: /pinterestbot/i, name: 'Pinterest', type: 'social' },
  
  // Other Bots
  { pattern: /semrushbot/i, name: 'SEMrush', type: 'other' },
  { pattern: /ahrefsbot/i, name: 'Ahrefs', type: 'other' },
  { pattern: /mj12bot/i, name: 'Majestic', type: 'other' },
  { pattern: /dotbot/i, name: 'Moz', type: 'other' },
  { pattern: /rogerbot/i, name: 'Moz', type: 'other' },
  { pattern: /screaming frog/i, name: 'Screaming Frog', type: 'other' },
  { pattern: /chrome-lighthouse/i, name: 'Lighthouse', type: 'other' },
  { pattern: /pagespeed/i, name: 'PageSpeed', type: 'other' },
]

function detectBot(userAgent: string): { name: string | null; type: string | null } {
  if (!userAgent) return { name: null, type: null }
  
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(userAgent)) {
      return { name: bot.name, type: bot.type }
    }
  }
  
  // Check for generic bot patterns
  if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    return { name: 'Unknown Bot', type: 'other' }
  }
  
  // Not a bot - manual test
  return { name: null, type: null }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    logStep('Method not allowed', { method: req.method })
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const startTime = Date.now()
    const body = await req.json()
    const { token, domain, url, cached, user_agent, render_time_ms } = body
    
    logStep('Received request', { token: token?.substring(0, 8) + '...', domain, url, cached })

    // Validate required fields
    if (!token || !domain || !url || cached === undefined || !user_agent) {
      logStep('Missing required fields', { token: !!token, domain: !!domain, url: !!url, cached: cached !== undefined, user_agent: !!user_agent })
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: token, domain, url, cached, user_agent' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Detect bot type
    const botInfo = detectBot(user_agent)
    logStep('Bot detection', botInfo)

    // Create Supabase client with SERVICE_ROLE_KEY (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep('Missing environment variables')
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find site by prerender_token
    logStep('Looking up site by prerender_token')
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, url, status, user_id, pages_rendered')
      .eq('prerender_token', token)
      .maybeSingle()

    if (siteError) {
      logStep('Database error looking up site', siteError)
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!site) {
      logStep('Invalid token - no site found')
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    logStep('Site found', { siteId: site.id, status: site.status, url: site.url })

    // Check if site is active
    if (site.status !== 'active') {
      logStep('Site not active', { status: site.status })
      return new Response(JSON.stringify({ success: false, error: 'Service suspended' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if domain matches site URL
    let siteDomain = ''
    try {
      if (site.url) {
        siteDomain = new URL(site.url).hostname
      }
    } catch {
      siteDomain = ''
    }

    if (siteDomain && siteDomain !== domain) {
      logStep('Domain mismatch', { requestDomain: domain, siteDomain })
      return new Response(JSON.stringify({ success: false, error: 'Domain not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert log with bot info
    logStep('Inserting prerender log')
    const { error: insertError } = await supabase
      .from('prerender_logs')
      .insert({
        site_id: site.id,
        token,
        domain,
        url,
        cached,
        user_agent,
        bot_name: botInfo.name,
        bot_type: botInfo.type,
        render_time_ms: render_time_ms || null
      })

    if (insertError) {
      logStep('Insert error', insertError)
      return new Response(JSON.stringify({ success: false, error: 'Failed to log' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update site stats: increment pages_rendered and update last_crawl
    logStep('Updating site stats')
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        pages_rendered: (site.pages_rendered || 0) + 1,
        last_crawl: new Date().toISOString()
      })
      .eq('id', site.id)

    if (updateError) {
      logStep('Update site error (non-blocking)', updateError)
    }

    // If it's a real bot, also update daily_stats
    if (botInfo.type) {
      const today = new Date().toISOString().split('T')[0]
      
      // Try to get existing stats for today
      const { data: existingStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', site.user_id)
        .eq('date', today)
        .maybeSingle()

      if (existingStats) {
        // Update existing
        const updates: Record<string, number> = {
          total_pages_rendered: existingStats.total_pages_rendered + 1,
          total_bots: existingStats.total_bots + 1
        }
        if (botInfo.type === 'search' && botInfo.name === 'Googlebot') {
          updates.google_crawls = existingStats.google_crawls + 1
        }
        if (botInfo.type === 'ai') {
          updates.ai_crawls = existingStats.ai_crawls + 1
        }
        
        await supabase
          .from('daily_stats')
          .update(updates)
          .eq('id', existingStats.id)
      } else {
        // Create new
        await supabase
          .from('daily_stats')
          .insert({
            user_id: site.user_id,
            date: today,
            total_pages_rendered: 1,
            total_bots: 1,
            google_crawls: botInfo.type === 'search' && botInfo.name === 'Googlebot' ? 1 : 0,
            ai_crawls: botInfo.type === 'ai' ? 1 : 0
          })
      }
    }

    const processingTime = Date.now() - startTime
    logStep('Log inserted successfully', { processingTime, botName: botInfo.name, botType: botInfo.type })
    
    return new Response(JSON.stringify({ 
      success: true, 
      bot: botInfo,
      processingTime 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    logStep('Unexpected error', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
