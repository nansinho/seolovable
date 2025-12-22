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
    const { text, sourceLang, targetLang, key } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, sourceLang, targetLang" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LIBRETRANSLATE_URL = "https://libretranslate.seolovable.cloud";

    console.log(`Translating from ${sourceLang} to ${targetLang}`);

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
      console.error(`LibreTranslate error: ${translateResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Translation service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translateResult = await translateResponse.json();
    const translatedText = translateResult.translatedText;

    console.log(`Translation completed`);

    // If a key is provided, save to database
    if (key) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        console.error("Error saving translation:", upsertError);
      } else {
        console.log(`Saved translation for key "${key}" in ${targetLang}`);
      }
    }

    return new Response(
      JSON.stringify({ translatedText, saved: !!key }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});
