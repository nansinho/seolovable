import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const LIBRETRANSLATE_URL = Deno.env.get("LIBRETRANSLATE_URL");
    if (!LIBRETRANSLATE_URL) {
      return new Response(
        JSON.stringify({ error: "LIBRETRANSLATE_URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Get all English translations
    const { data: enTranslations, error: enError } = await supabase
      .from("translations")
      .select("key")
      .eq("lang", "en");

    if (enError) {
      console.error("Error fetching EN translations:", enError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch target translations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingEnKeys = new Set(enTranslations?.map((t) => t.key) || []);
    const missingKeys = frTranslations?.filter((t) => !existingEnKeys.has(t.key)) || [];

    console.log(`Found ${missingKeys.length} missing English translations`);

    let translated = 0;
    let errors = 0;

    for (const item of missingKeys) {
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
          console.error(`Failed to translate ${item.key}: ${translateResponse.status}`);
          errors++;
          continue;
        }

        const result = await translateResponse.json();
        const translatedText = result.translatedText;

        const { error: insertError } = await supabase.from("translations").insert({
          key: item.key,
          lang: "en",
          value: translatedText,
          is_auto: true,
        });

        if (insertError) {
          console.error(`Failed to save ${item.key}:`, insertError);
          errors++;
        } else {
          translated++;
          console.log(`Translated: ${item.key} -> ${translatedText.substring(0, 30)}...`);
        }

        // Small delay to avoid overwhelming LibreTranslate
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (e) {
        console.error(`Error translating ${item.key}:`, e);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: missingKeys.length,
        translated,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
