import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/security.ts";

const MAX_TEXT_LENGTH = 5000;
const MAX_KEY_LENGTH = 255;

/**
 * Edge function to translate a single key via LibreTranslate
 * ADMIN ONLY - Requires admin role to use
 */
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

    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[translate-single] Missing or invalid auth header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log("[translate-single] Invalid token");
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      console.log("[translate-single] User is not admin:", user.id);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { key, frenchText } = await req.json();

    // Input validation
    if (!key || typeof key !== "string") {
      return new Response(
        JSON.stringify({ error: "key is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!frenchText || typeof frenchText !== "string") {
      return new Response(
        JSON.stringify({ error: "frenchText is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (key.length > MAX_KEY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `key must be less than ${MAX_KEY_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (frenchText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `frenchText must be less than ${MAX_TEXT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LIBRETRANSLATE_URL = "https://libretranslate.seolovable.cloud";

    console.log(`[translate-single] Admin ${user.email} translating key: ${key}`);

    // Call LibreTranslate
    const translateResponse = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: frenchText,
        source: "fr",
        target: "en",
      }),
    });

    if (!translateResponse.ok) {
      const errorText = await translateResponse.text();
      console.error(`[translate-single] LibreTranslate error: ${translateResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: "LibreTranslate translation failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await translateResponse.json();
    const translatedText = result.translatedText;

    console.log(`[translate-single] Translated: ${translatedText}`);

    // Save to database
    const { error: upsertError } = await supabase
      .from("translations")
      .upsert(
        { key, lang: "en", value: translatedText, is_auto: true },
        { onConflict: "key,lang" }
      );

    if (upsertError) {
      console.error(`[translate-single] DB upsert error:`, upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save translation", details: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        key,
        translatedText,
        is_auto: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[translate-single] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});
