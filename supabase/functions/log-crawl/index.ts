import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, validateUrlSafe } from "../_shared/security.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[LOG-CRAWL] ${step}${detailsStr}`);
};

// Detect bot type from user agent
function detectBotType(userAgent: string): { botName: string; botType: string } | null {
  const ua = userAgent.toLowerCase();
  
  // Google bots
  if (ua.includes("googlebot")) {
    return { botName: "Googlebot", botType: "search" };
  }
  if (ua.includes("google-inspectiontool")) {
    return { botName: "Google Inspection Tool", botType: "search" };
  }
  if (ua.includes("adsbot-google")) {
    return { botName: "AdsBot-Google", botType: "search" };
  }
  
  // Bing bot
  if (ua.includes("bingbot")) {
    return { botName: "Bingbot", botType: "search" };
  }
  
  // Yahoo bot
  if (ua.includes("slurp")) {
    return { botName: "Yahoo Slurp", botType: "search" };
  }
  
  // DuckDuckGo
  if (ua.includes("duckduckbot")) {
    return { botName: "DuckDuckBot", botType: "search" };
  }
  
  // Baidu
  if (ua.includes("baiduspider")) {
    return { botName: "Baiduspider", botType: "search" };
  }
  
  // Yandex
  if (ua.includes("yandexbot")) {
    return { botName: "YandexBot", botType: "search" };
  }
  
  // AI Bots
  if (ua.includes("gptbot") || ua.includes("chatgpt")) {
    return { botName: "GPTBot", botType: "ai" };
  }
  if (ua.includes("anthropic") || ua.includes("claude")) {
    return { botName: "ClaudeBot", botType: "ai" };
  }
  if (ua.includes("perplexity")) {
    return { botName: "PerplexityBot", botType: "ai" };
  }
  if (ua.includes("cohere")) {
    return { botName: "CohereBot", botType: "ai" };
  }
  if (ua.includes("youbot")) {
    return { botName: "YouBot", botType: "ai" };
  }
  if (ua.includes("ccbot")) {
    return { botName: "CCBot", botType: "ai" };
  }
  
  // Generic crawler detection
  if (ua.includes("crawler") || ua.includes("spider") || ua.includes("bot")) {
    return { botName: "Unknown Crawler", botType: "other" };
  }
  
  return null;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { siteId, url, userAgent, pagesCrawled = 1 } = body;

    if (!siteId && !url) {
      throw new Error("Either siteId or url is required");
    }

    logStep("Request received", { siteId, userAgent: userAgent?.substring(0, 50) });

    // Detect bot from user agent
    const botInfo = userAgent ? detectBotType(userAgent) : null;
    
    if (!botInfo) {
      logStep("No bot detected from user agent");
      return new Response(
        JSON.stringify({
          success: true,
          logged: false,
          reason: "Not a recognized bot",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Bot detected", botInfo);

    // Find site by ID or URL
    let site;
    if (siteId) {
      const { data, error } = await supabaseClient
        .from("sites")
        .select("id, user_id, pages_rendered, prerender_token, url")
        .eq("id", siteId)
        .single();
      
      if (error || !data) throw new Error("Site not found");
      site = data;
    } else if (url) {
      // Validate URL with SSRF protection before processing
      const urlValidation = validateUrlSafe(url);
      if (!urlValidation.valid || !urlValidation.url) {
        logStep("Invalid URL provided", { error: urlValidation.error });
        return new Response(
          JSON.stringify({
            success: false,
            error: urlValidation.error || "Invalid URL format",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const hostname = urlValidation.url.hostname;
      
      const { data, error } = await supabaseClient
        .from("sites")
        .select("id, user_id, pages_rendered, prerender_token, url")
        .ilike("url", `%${hostname}%`)
        .limit(1)
        .maybeSingle();
      
      if (error || !data) {
        logStep("Site not found for URL", { hostname });
        return new Response(
          JSON.stringify({
            success: true,
            logged: false,
            reason: "Site not registered",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      site = data;
    }

    if (!site) {
      throw new Error("Could not determine site");
    }

    logStep("Site found", { siteId: site.id });

    // Get domain from site URL
    let domain = '';
    try {
      if (site.url) {
        domain = new URL(site.url).hostname;
      }
    } catch {
      domain = 'unknown';
    }

    // INSERT INTO prerender_logs (unified table) instead of bot_activity
    const logUrl = url || site.url || '';
    const { error: logError } = await supabaseClient
      .from("prerender_logs")
      .insert({
        site_id: site.id,
        token: site.prerender_token,
        domain: domain,
        url: logUrl,
        cached: false, // Simulated crawls are not cached
        user_agent: userAgent,
        bot_name: botInfo.botName,
        bot_type: botInfo.botType,
        render_time_ms: null,
        source: 'simulate' // Mark as simulated crawl
      });

    if (logError) {
      logStep("Error inserting prerender log", { error: logError.message });
    } else {
      logStep("Prerender log inserted with source=simulate");
    }

    // Update site stats
    const { error: siteUpdateError } = await supabaseClient
      .from("sites")
      .update({
        last_crawl: new Date().toISOString(),
        pages_rendered: (site.pages_rendered || 0) + pagesCrawled,
      })
      .eq("id", site.id);

    if (siteUpdateError) {
      logStep("Error updating site stats", { error: siteUpdateError.message });
    } else {
      logStep("Site stats updated");
    }

    // Update daily stats
    const today = new Date().toISOString().split("T")[0];
    
    // Try to find existing daily stat
    const { data: existingStat } = await supabaseClient
      .from("daily_stats")
      .select("id, total_bots, total_pages_rendered, google_crawls, ai_crawls")
      .eq("user_id", site.user_id)
      .eq("date", today)
      .maybeSingle();

    if (existingStat) {
      // Update existing
      const updates = {
        total_bots: (existingStat.total_bots || 0) + 1,
        total_pages_rendered: (existingStat.total_pages_rendered || 0) + pagesCrawled,
        google_crawls: existingStat.google_crawls || 0,
        ai_crawls: existingStat.ai_crawls || 0,
      };

      if (botInfo.botType === "search") {
        updates.google_crawls += 1;
      } else if (botInfo.botType === "ai") {
        updates.ai_crawls += 1;
      }

      const { error: statsUpdateError } = await supabaseClient
        .from("daily_stats")
        .update(updates)
        .eq("id", existingStat.id);

      if (statsUpdateError) {
        logStep("Error updating daily stats", { error: statsUpdateError.message });
      } else {
        logStep("Daily stats updated");
      }
    } else {
      // Insert new daily stat
      const newStat = {
        user_id: site.user_id,
        date: today,
        total_bots: 1,
        total_pages_rendered: pagesCrawled,
        google_crawls: botInfo.botType === "search" ? 1 : 0,
        ai_crawls: botInfo.botType === "ai" ? 1 : 0,
      };

      const { error: statsInsertError } = await supabaseClient
        .from("daily_stats")
        .insert(newStat);

      if (statsInsertError) {
        logStep("Error inserting daily stats", { error: statsInsertError.message });
      } else {
        logStep("Daily stats created");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        logged: true,
        botName: botInfo.botName,
        botType: botInfo.botType,
        siteId: site.id,
        source: 'simulate'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...getCorsHeaders(null), "Content-Type": "application/json" },
      }
    );
  }
});
