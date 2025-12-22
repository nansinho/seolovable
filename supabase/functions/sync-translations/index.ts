import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/security.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body for force mode
    let forceRetranslate = false;
    try {
      const body = await req.json();
      forceRetranslate = body?.force === true;
    } catch {
      // No body or invalid JSON, use defaults
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const LIBRETRANSLATE_URL = "https://libretranslate.seolovable.cloud";
    const BATCH_SIZE = 20; // Process 20 translations max per call to avoid timeout

    // Get all French translations (source)
    const { data: frTranslations, error: frError } = await supabase
      .from("translations")
      .select("key, value")
      .eq("lang", "fr");

    if (frError) {
      console.error("Error fetching FR translations:", frError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch source translations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let keysToTranslate: { key: string; value: string }[] = [];

    // Get existing EN translations
    const { data: enTranslations, error: enError } = await supabase
      .from("translations")
      .select("key, is_auto")
      .eq("lang", "en");

    if (enError) {
      console.error("Error fetching EN translations:", enError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch target translations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingEnKeys = new Map((enTranslations || []).map((t) => [t.key, t.is_auto]));

    if (forceRetranslate) {
      // Force mode: re-translate keys that are NOT already is_auto=true
      // This converts manual translations to API translations
      console.log("Force mode: will re-translate non-API EN translations");
      keysToTranslate = (frTranslations || []).filter((t) => {
        const isAuto = existingEnKeys.get(t.key);
        // Include if: no EN exists, or EN exists but is manual (is_auto=false)
        return isAuto === undefined || isAuto === false;
      });
    } else {
      // Normal mode: only translate missing keys
      keysToTranslate = (frTranslations || []).filter((t) => !existingEnKeys.has(t.key));
    }

    console.log(`Found ${keysToTranslate.length} keys to translate (force=${forceRetranslate})`);

    // Only process BATCH_SIZE at a time to avoid timeout
    const batch = keysToTranslate.slice(0, BATCH_SIZE);
    const remaining = keysToTranslate.length - batch.length;

    let translated = 0;
    let errors = 0;

    for (const item of batch) {
      try {
        console.log(`Translating key: ${item.key}`);

        const translateResponse = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: item.value,
            source: "fr",
            target: "en",
          }),
        });

        if (!translateResponse.ok) {
          const errorText = await translateResponse.text();
          console.error(`Failed to translate ${item.key}: ${translateResponse.status} - ${errorText}`);
          errors++;
          continue;
        }

        const result = await translateResponse.json();
        const translatedText = result.translatedText;

        console.log(`Translated ${item.key}: "${item.value}" -> "${translatedText}"`);

        // Use upsert to handle both new and existing translations
        const { error: upsertError } = await supabase
          .from("translations")
          .upsert(
            { key: item.key, lang: "en", value: translatedText, is_auto: true },
            { onConflict: "key,lang" }
          );

        if (upsertError) {
          console.error(`Failed to save ${item.key}:`, upsertError);
          errors++;
        } else {
          translated++;
        }

        // Small delay to avoid overwhelming LibreTranslate
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.error(`Error translating ${item.key}:`, e);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: keysToTranslate.length,
        processed: batch.length,
        translated,
        errors,
        remaining,
        hasMore: remaining > 0,
        forceMode: forceRetranslate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});
