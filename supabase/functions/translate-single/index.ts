import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/security.ts";

/**
 * Edge function to translate a single key via LibreTranslate
 * Used when manually editing EN translations - forces LibreTranslate usage
 */
serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, frenchText } = await req.json();

    if (!key || !frenchText) {
      return new Response(
        JSON.stringify({ error: "key and frenchText are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LIBRETRANSLATE_URL = "https://libretranslate.seolovable.cloud";

    console.log(`[translate-single] Translating key: ${key}`);
    console.log(`[translate-single] French text: ${frenchText}`);

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
