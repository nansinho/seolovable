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

  const workerCode = `// SEOLovable Cloudflare Worker - Prerender avec tracking
// Site: ${siteUrl}
// Token: ${prerenderToken}

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
const PRERENDER_SERVICE = 'https://prerender.seolovable.fr';

// Token et config
const PRERENDER_TOKEN = '${prerenderToken}';
const LOG_ENDPOINT = '${supabaseUrl}/functions/v1/log-prerender';

const IGNORE_EXTENSIONS = [
  '.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif', '.pdf',
  '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar', '.exe', '.wmv',
  '.avi', '.ppt', '.mpg', '.mpeg', '.tif', '.wav', '.mov', '.psd', '.woff',
  '.woff2', '.ttf', '.svg', '.eot', '.webp', '.webm', '.mp4', '.m4a', '.swf'
];

async function logPrerender(url, userAgent, cached, renderTimeMs) {
  try {
    const domain = new URL(url).hostname;
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: PRERENDER_TOKEN,
        domain,
        url,
        cached,
        user_agent: userAgent,
        render_time_ms: renderTimeMs
      })
    });
  } catch (e) {
    console.error('Log error:', e);
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const pathname = url.pathname.toLowerCase();

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

  if (!isBot) {
    return fetch(request);
  }

  // Prerender for bots
  const startTime = Date.now();
  const prerenderUrl = \`\${PRERENDER_SERVICE}/\${encodeURIComponent(url.toString())}?token=\${PRERENDER_TOKEN}\`;
  
  try {
    const response = await fetch(prerenderUrl, {
      headers: {
        'User-Agent': userAgent,
        'X-Prerender-Token': PRERENDER_TOKEN
      },
    });
    
    const renderTimeMs = Date.now() - startTime;
    const cached = response.headers.get('X-Prerender-Cache') === 'HIT';
    
    // Log the prerender (non-blocking)
    logPrerender(url.toString(), userAgent, cached, renderTimeMs);
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerender-Status': 'rendered',
        'X-Prerender-Time': renderTimeMs.toString() + 'ms',
        'X-Prerender-Cache': cached ? 'HIT' : 'MISS'
      },
    });
  } catch (error) {
    console.error('Prerender error:', error);
    return fetch(request);
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});`;

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
