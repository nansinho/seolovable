import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function logStep(step: string, details?: unknown) {
  console.log(`[log-prerender] ${step}`, details ? JSON.stringify(details) : '')
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
    const body = await req.json()
    const { token, domain, url, cached, user_agent } = body
    
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

    // Find site by prerender_token (NEW: using sites table instead of clients)
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

    // Insert log with site_id
    logStep('Inserting prerender log')
    const { error: insertError } = await supabase
      .from('prerender_logs')
      .insert({
        site_id: site.id,
        token,
        domain,
        url,
        cached,
        user_agent
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
      // Non-blocking - log was already inserted
    }

    logStep('Log inserted successfully')
    return new Response(JSON.stringify({ success: true }), {
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
