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

    // Find client by token
    logStep('Looking up client by token')
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, allowed_domains, status')
      .eq('prerender_token', token)
      .maybeSingle()

    if (clientError) {
      logStep('Database error looking up client', clientError)
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!client) {
      logStep('Invalid token - no client found')
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    logStep('Client found', { clientId: client.id, status: client.status, allowedDomains: client.allowed_domains })

    // Check if client is active
    if (client.status !== 'active') {
      logStep('Client not active', { status: client.status })
      return new Response(JSON.stringify({ success: false, error: 'Service suspended' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if domain is allowed
    const allowedDomains = client.allowed_domains || []
    if (!allowedDomains.includes(domain)) {
      logStep('Domain not allowed', { domain, allowedDomains })
      return new Response(JSON.stringify({ success: false, error: 'Domain not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert log
    logStep('Inserting prerender log')
    const { error: insertError } = await supabase
      .from('prerender_logs')
      .insert({
        client_id: client.id,
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
