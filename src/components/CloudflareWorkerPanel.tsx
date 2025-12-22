import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Cloud, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CloudflareWorkerPanelProps {
  prerenderToken: string;
  siteUrl: string;
}

export function CloudflareWorkerPanel({ prerenderToken, siteUrl }: CloudflareWorkerPanelProps) {
  const [copiedWorker, setCopiedWorker] = useState(false);
  const { t } = useI18n();

  // Extract domain from site URL
  let domain = "";
  try {
    domain = new URL(siteUrl).hostname;
  } catch {
    domain = siteUrl;
  }

  // Get Supabase URL from env
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const workerCode = `// SEOLovable Cloudflare Worker - Prerender avec tracking fiable
// Site: ${siteUrl}
// Token: ${prerenderToken}
// Version: 2.0 - URL encoding + fallback + waitUntil logging

const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
  'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkShare', 'W3C_Validator',
  'redditbot', 'Applebot', 'WhatsApp', 'flipboard', 'tumblr', 'bitlybot',
  'SkypeUriPreview', 'nuzzel', 'Discordbot', 'Google Page Speed', 'Qwantify',
  'pinterestbot', 'Bitrix link preview', 'XING-contenttabreceiver', 'Chrome-Lighthouse',
  'GPTBot', 'ChatGPT-User', 'anthropic-ai', 'Claude-Web', 'Bytespider', 'cohere-ai',
  'PerplexityBot', 'CCBot', 'YouBot', 'Google-Extended', 'Semrushbot', 'AhrefsBot'
];

// URL du service de prerendering
const PRERENDER_SERVICE = 'https://prerender.seolovable.cloud';

// Token et config
const PRERENDER_TOKEN = '${prerenderToken}';
const SITE_URL = '${siteUrl}';
const LOG_ENDPOINT = '${supabaseUrl}/functions/v1/log-prerender';

const IGNORE_EXTENSIONS = [
  '.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif', '.pdf',
  '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar', '.exe', '.wmv',
  '.avi', '.ppt', '.mpg', '.mpeg', '.tif', '.wav', '.mov', '.psd', '.woff',
  '.woff2', '.ttf', '.svg', '.eot', '.webp', '.webm', '.mp4', '.m4a', '.swf'
];

// Logging fiable avec waitUntil
async function logPrerender(url, userAgent, cached, renderTimeMs, source) {
  try {
    const domain = new URL(url).hostname;
    const response = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: PRERENDER_TOKEN,
        domain,
        url,
        cached,
        user_agent: userAgent,
        render_time_ms: renderTimeMs,
        source: source // Pour debug: quel format a fonctionné
      })
    });
    if (!response.ok) {
      console.error('Log failed:', response.status, await response.text());
    }
  } catch (e) {
    console.error('Log error:', e);
  }
}

// Tente un format d'URL prerender
async function tryPrerender(prerenderUrl, userAgent) {
  const response = await fetch(prerenderUrl, {
    headers: {
      'User-Agent': userAgent,
      'X-Prerender-Token': PRERENDER_TOKEN
    },
    cf: { cacheTtl: 0 } // Pas de cache CF pour le debug
  });
  return response;
}

async function handleRequest(request, ctx) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const pathname = url.pathname.toLowerCase();
  const isDebug = url.searchParams.has('__prerender_debug');

  // Ignore static files
  for (const ext of IGNORE_EXTENSIONS) {
    if (pathname.endsWith(ext)) {
      return fetch(request);
    }
  }

  // Check if request is from a bot
  const isBot = BOT_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  if (!isBot && !isDebug) {
    return fetch(request);
  }

  const startTime = Date.now();
  const fullUrl = url.toString();
  
  // Format A: URL encodée (recommandé)
  const encodedUrl = encodeURIComponent(fullUrl);
  const prerenderUrlA = PRERENDER_SERVICE + '/' + encodedUrl;
  
  // Format B: Token + path (fallback legacy)
  const prerenderUrlB = PRERENDER_SERVICE + '/' + PRERENDER_TOKEN + url.pathname + url.search;

  let response = null;
  let source = 'none';
  let lastError = null;

  // Essayer Format A d'abord
  try {
    response = await tryPrerender(prerenderUrlA, userAgent);
    if (response.ok || response.status === 304) {
      source = 'encodedUrl';
    } else {
      console.log('Format A failed:', response.status);
      response = null;
    }
  } catch (e) {
    console.error('Format A error:', e);
    lastError = e;
  }

  // Fallback Format B si A a échoué
  if (!response) {
    try {
      response = await tryPrerender(prerenderUrlB, userAgent);
      if (response.ok || response.status === 304) {
        source = 'tokenPath';
      } else {
        console.log('Format B failed:', response.status);
        response = null;
      }
    } catch (e) {
      console.error('Format B error:', e);
      lastError = e;
    }
  }

  // Si les deux ont échoué, retourner la page originale
  if (!response) {
    console.error('All prerender formats failed, serving original');
    const originalResponse = await fetch(request);
    return new Response(originalResponse.body, {
      status: originalResponse.status,
      headers: {
        ...Object.fromEntries(originalResponse.headers),
        'X-Prerender-Status': 'fallback',
        'X-Prerender-Error': lastError ? lastError.message : 'All formats failed'
      }
    });
  }
  
  const renderTimeMs = Date.now() - startTime;
  const cached = response.headers.get('X-Prerender-Cache') === 'HIT';
  
  // Log avec waitUntil pour fiabilité (non-blocking mais garanti)
  if (ctx && ctx.waitUntil) {
    ctx.waitUntil(logPrerender(fullUrl, userAgent, cached, renderTimeMs, source));
  } else {
    // Fallback si pas de ctx
    logPrerender(fullUrl, userAgent, cached, renderTimeMs, source);
  }
  
  // Headers de debug
  const responseHeaders = {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Prerender-Status': 'rendered',
    'X-Prerender-Source': source,
    'X-Prerender-Time': renderTimeMs + 'ms',
    'X-Prerender-Cache': cached ? 'HIT' : 'MISS'
  };
  
  if (isDebug) {
    responseHeaders['X-Prerender-Debug'] = 'true';
    responseHeaders['X-Prerender-URL-A'] = prerenderUrlA;
    responseHeaders['X-Prerender-URL-B'] = prerenderUrlB;
  }
  
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, ctx);
  }
};`;

  const handleCopyWorker = async () => {
    await navigator.clipboard.writeText(workerCode);
    setCopiedWorker(true);
    toast.success("Code Worker copié !");
    setTimeout(() => setCopiedWorker(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-semibold font-code text-foreground">
            Cloudflare Worker
          </h3>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleCopyWorker}
          className="font-code text-xs"
        >
          {copiedWorker ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1 text-green-300" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copier le code
            </>
          )}
        </Button>
      </div>

      {/* Code Section */}
      <div className="relative mb-4">
        <pre className="p-4 rounded-lg bg-muted/50 border border-border overflow-x-auto text-xs font-mono text-foreground max-h-80 overflow-y-auto">
          {workerCode}
        </pre>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</span>
            Créer le Worker
          </p>
          <p className="text-xs text-muted-foreground font-code pl-7">
            Allez dans <a href="https://dash.cloudflare.com/?to=/:account/workers-and-pages" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
              Cloudflare Dashboard → Workers <ExternalLink className="w-3 h-3" />
            </a> et créez un nouveau Worker.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</span>
            Coller le code
          </p>
          <p className="text-xs text-muted-foreground font-code pl-7">
            Remplacez le code par défaut par le code ci-dessus, puis cliquez sur "Save and Deploy".
          </p>
        </div>

        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">3</span>
            Ajouter les routes
          </p>
          <p className="text-xs text-muted-foreground font-code pl-7">
            Dans Workers → Routes, ajoutez les routes suivantes :
          </p>
          <div className="mt-2 ml-7 p-2 rounded bg-muted/50 font-mono text-xs text-foreground">
            <div>{domain}/*</div>
            {domain.startsWith("www.") ? null : <div>www.{domain}/*</div>}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
            Tester
          </p>
          <p className="text-xs text-muted-foreground font-code pl-7">
            Testez avec : <code className="px-1 py-0.5 rounded bg-muted">curl -A "Googlebot" {siteUrl}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
