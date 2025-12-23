import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/security.ts";

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MAX_TEXT_LENGTH = 5000; // characters

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Check if user is admin
async function isAdmin(supabase: any, authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  
  try {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return false;
    }
    
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    return !!roleData;
  } catch {
    return false;
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";

    // Check authentication - only admins can use this function
    const authHeader = req.headers.get("authorization");
    const userIsAdmin = await isAdmin(supabase, authHeader);
    
    if (!userIsAdmin) {
      // Apply rate limiting for non-admin users
      if (!checkRateLimit(clientIP)) {
        console.log(`[translate] Rate limited IP: ${clientIP.slice(0, 8)}...`);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { text, sourceLang, targetLang, key } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, sourceLang, targetLang" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate text length
    if (typeof text !== "string" || text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text must be a string with maximum ${MAX_TEXT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate language codes (basic check)
    const validLangs = ["en", "fr", "es", "de", "it", "pt", "nl", "ru", "zh", "ja", "ko", "ar"];
    if (!validLangs.includes(sourceLang) || !validLangs.includes(targetLang)) {
      return new Response(
        JSON.stringify({ error: "Invalid language code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only admins can save to database (key parameter)
    if (key && !userIsAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins can save translations to database" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LIBRETRANSLATE_URL = "https://libretranslate.seolovable.cloud";

    console.log(`[translate] Translating from ${sourceLang} to ${targetLang} (admin: ${userIsAdmin})`);

    // Call LibreTranslate
    const translateResponse = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!translateResponse.ok) {
      const errorText = await translateResponse.text();
      console.error(`[translate] LibreTranslate error: ${translateResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Translation service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translateResult = await translateResponse.json();
    const translatedText = translateResult.translatedText;

    console.log(`[translate] Translation completed`);

    // If a key is provided and user is admin, save to database
    if (key && userIsAdmin) {
      const { error: upsertError } = await supabase
        .from("translations")
        .upsert(
          {
            key,
            lang: targetLang,
            value: translatedText,
            is_auto: true,
          },
          { onConflict: "key,lang" }
        );

      if (upsertError) {
        console.error("[translate] Error saving translation:", upsertError);
      } else {
        console.log(`[translate] Saved translation for key "${key}" in ${targetLang}`);
      }
    }

    return new Response(
      JSON.stringify({ translatedText, saved: !!key && userIsAdmin }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[translate] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});
