import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  CheckCircle,
  Cloud,
  ExternalLink,
  Server,
  Globe,
  Code2,
  Rocket,
  AlertCircle,
  ChevronRight,
  FileCode,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface IntegrationGuideProps {
  prerenderToken: string;
  siteUrl: string;
}

export function IntegrationGuide({ prerenderToken, siteUrl }: IntegrationGuideProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { t } = useI18n();

  let domain = "";
  try {
    domain = new URL(siteUrl).hostname;
  } catch {
    domain = siteUrl;
  }

  const backendUrl = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(prerenderToken);
    setCopiedToken(true);
    toast.success("Token copié !");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Code copié !");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Cloudflare Worker code
  const cloudflareCode = `// SEOLovable - Cloudflare Worker
// 🌐 Site: ${siteUrl}

const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'slackbot', 'telegrambot', 'whatsapp',
  'GPTBot', 'ChatGPT-User', 'anthropic-ai', 'Claude-Web', 'PerplexityBot',
  'Bytespider', 'cohere-ai', 'CCBot', 'YouBot', 'Google-Extended',
  'Semrushbot', 'AhrefsBot', 'rogerbot', 'Applebot', 'Discordbot'
];

const PRERENDER_SERVICE = 'https://prerender.seolovable.fr';
const PRERENDER_TOKEN = '${prerenderToken}';
const LOG_ENDPOINT = '${backendUrl}/functions/v1/log-prerender';
const API_KEY = '${publishableKey}';

const IGNORE_EXT = ['.js','.css','.png','.jpg','.jpeg','.gif','.svg','.ico','.woff','.woff2'];

async function logPrerender(url, userAgent, cached, renderTimeMs) {
  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': API_KEY },
      body: JSON.stringify({
        token: PRERENDER_TOKEN,
        domain: new URL(url).hostname,
        url, cached, user_agent: userAgent, render_time_ms: renderTimeMs
      })
    });
  } catch (e) { console.error('Log error:', e); }
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Ignore static files
  if (IGNORE_EXT.some(ext => url.pathname.toLowerCase().endsWith(ext))) {
    return fetch(request);
  }
  
  // Check if bot
  const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  if (!isBot) return fetch(request);
  
  // Prerender for bots
  const startTime = Date.now();
  try {
    const prerenderUrl = \`\${PRERENDER_SERVICE}/\${encodeURIComponent(url.toString())}?token=\${PRERENDER_TOKEN}\`;
    const response = await fetch(prerenderUrl, {
      headers: { 'User-Agent': userAgent, 'X-Prerender-Token': PRERENDER_TOKEN }
    });
    
    const renderTimeMs = Date.now() - startTime;
    const cached = response.headers.get('X-Prerender-Cache') === 'HIT';
    logPrerender(url.toString(), userAgent, cached, renderTimeMs);
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerender-Status': 'rendered',
        'X-Prerender-Time': renderTimeMs + 'ms'
      }
    });
  } catch (error) {
    console.error('Prerender error:', error);
    return fetch(request);
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});`;

  // Nginx config
  const nginxCode = `# SEOLovable - Configuration Nginx
# Ajoutez ceci dans votre bloc server {}

# Liste des bots à prérenderer
map $http_user_agent $is_bot {
    default 0;
    ~*googlebot 1;
    ~*bingbot 1;
    ~*yandex 1;
    ~*baiduspider 1;
    ~*facebookexternalhit 1;
    ~*twitterbot 1;
    ~*linkedinbot 1;
    ~*GPTBot 1;
    ~*ChatGPT 1;
    ~*anthropic 1;
    ~*Claude 1;
    ~*PerplexityBot 1;
}

location / {
    # Si c'est un bot, prérenderer
    if ($is_bot) {
        set $prerender_url "https://prerender.seolovable.fr/$scheme://$host$request_uri?token=${prerenderToken}";
        proxy_pass $prerender_url;
        proxy_set_header X-Prerender-Token "${prerenderToken}";
        proxy_set_header User-Agent $http_user_agent;
        break;
    }
    
    # Sinon, servir normalement
    try_files $uri $uri/ /index.html;
}`;

  // Apache .htaccess
  const apacheCode = `# SEOLovable - Configuration Apache (.htaccess)
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Liste des User-Agents de bots
    RewriteCond %{HTTP_USER_AGENT} (googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|GPTBot|ChatGPT|anthropic|Claude|PerplexityBot) [NC]
    
    # Ignorer les fichiers statiques
    RewriteCond %{REQUEST_URI} !\\.(js|css|xml|png|jpg|jpeg|gif|ico|svg|woff|woff2)$
    
    # Rediriger vers le service de prerendering
    RewriteRule ^(.*)$ https://prerender.seolovable.fr/%{REQUEST_SCHEME}://%{HTTP_HOST}/$1?token=${prerenderToken} [P,L]
</IfModule>`;

  // Node.js Express middleware
  const expressCode = `// SEOLovable - Express.js Middleware
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'GPTBot', 'ChatGPT', 'anthropic',
  'Claude', 'PerplexityBot', 'Bytespider', 'cohere-ai'
];

const PRERENDER_TOKEN = '${prerenderToken}';
const PRERENDER_URL = 'https://prerender.seolovable.fr';

function prerenderMiddleware(req, res, next) {
  const userAgent = req.get('User-Agent') || '';
  
  // Check if bot
  const isBot = BOT_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (!isBot) return next();
  
  // Ignore static files
  const staticExts = ['.js', '.css', '.png', '.jpg', '.gif', '.ico', '.svg'];
  if (staticExts.some(ext => req.path.endsWith(ext))) return next();
  
  // Prerender
  const targetUrl = \`\${req.protocol}://\${req.get('host')}\${req.originalUrl}\`;
  const prerenderUrl = \`\${PRERENDER_URL}/\${encodeURIComponent(targetUrl)}?token=\${PRERENDER_TOKEN}\`;
  
  fetch(prerenderUrl, {
    headers: { 'User-Agent': userAgent, 'X-Prerender-Token': PRERENDER_TOKEN }
  })
    .then(response => response.text())
    .then(html => {
      res.set('Content-Type', 'text/html');
      res.set('X-Prerender-Status', 'rendered');
      res.send(html);
    })
    .catch(() => next());
}

// Usage: app.use(prerenderMiddleware);
module.exports = prerenderMiddleware;`;

  const Step = ({ number, title, children, variant = "default" }: { number: number | string; title: string; children: React.ReactNode; variant?: "default" | "success" }) => (
    <div className={`p-4 rounded-xl border ${variant === "success" ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-border"}`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${variant === "success" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm mb-2">{title}</h4>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );

  const CodeBlock = ({ code, language }: { code: string; language: string }) => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopyCode(code)}
        className="absolute top-2 right-2 z-10 font-code text-xs h-7"
      >
        {copiedCode ? (
          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
        ) : (
          <Copy className="w-3 h-3 mr-1" />
        )}
        Copier
      </Button>
      <ScrollArea className="h-[280px]">
        <pre className="p-4 rounded-xl bg-zinc-950 border border-border text-xs font-mono text-foreground overflow-x-auto">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Token Section */}
      <div className="p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Votre Token Prerender</h3>
            <p className="text-xs text-muted-foreground">Utilisez ce token pour authentifier vos requêtes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-4 py-3 rounded-xl bg-muted font-mono text-sm text-foreground break-all border border-border">
            {prerenderToken}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopyToken} className="h-11 w-11 shrink-0">
            {copiedToken ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Integration Tabs */}
      <div className="p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Guide d'intégration</h3>
            <p className="text-xs text-muted-foreground">Choisissez votre plateforme et suivez les étapes</p>
          </div>
        </div>

        <Tabs defaultValue="cloudflare" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl mb-5">
            <TabsTrigger value="cloudflare" className="flex items-center gap-2 py-2.5 px-3 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500 rounded-lg text-xs font-medium">
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">Cloudflare</span>
            </TabsTrigger>
            <TabsTrigger value="nginx" className="flex items-center gap-2 py-2.5 px-3 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500 rounded-lg text-xs font-medium">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">Nginx</span>
            </TabsTrigger>
            <TabsTrigger value="apache" className="flex items-center gap-2 py-2.5 px-3 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500 rounded-lg text-xs font-medium">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Apache</span>
            </TabsTrigger>
            <TabsTrigger value="express" className="flex items-center gap-2 py-2.5 px-3 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 rounded-lg text-xs font-medium">
              <FileCode className="w-4 h-4" />
              <span className="hidden sm:inline">Node.js</span>
            </TabsTrigger>
          </TabsList>

          {/* Cloudflare Tab */}
          <TabsContent value="cloudflare" className="space-y-4 mt-0">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Cloud className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-foreground font-medium">
                Cloudflare Workers — Recommandé pour les sites hébergés sur Cloudflare
              </p>
            </div>

            <CodeBlock code={cloudflareCode} language="javascript" />

            <div className="space-y-3">
              <Step number={1} title="Créer un Worker">
                <p>
                  Rendez-vous sur{" "}
                  <a
                    href="https://dash.cloudflare.com/?to=/:account/workers-and-pages"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Cloudflare Dashboard → Workers & Pages
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {" "}et cliquez sur <strong>"Create"</strong> puis <strong>"Create Worker"</strong>.
                </p>
              </Step>

              <Step number={2} title="Coller le code">
                <p>
                  Supprimez le code par défaut et collez le code ci-dessus.
                  Cliquez sur <strong>"Deploy"</strong> pour sauvegarder.
                </p>
              </Step>

              <Step number={3} title="Configurer les routes">
                <p className="mb-2">
                  Allez dans votre Worker → <strong>Settings</strong> → <strong>Domains & Routes</strong> → <strong>Add route</strong>
                </p>
                <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    <code>{domain}/*</code>
                  </div>
                  {!domain.startsWith("www.") && (
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      <code>www.{domain}/*</code>
                    </div>
                  )}
                </div>
              </Step>

              <Step number="✓" title="Tester l'intégration" variant="success">
                <p className="mb-2">Vérifiez que tout fonctionne avec cette commande :</p>
                <code className="block p-2 rounded bg-muted/50 text-xs font-mono break-all">
                  curl -A "Googlebot" {siteUrl}
                </code>
              </Step>
            </div>
          </TabsContent>

          {/* Nginx Tab */}
          <TabsContent value="nginx" className="space-y-4 mt-0">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <Server className="w-5 h-5 text-green-500" />
              <p className="text-sm text-foreground font-medium">
                Nginx — Pour les serveurs VPS/dédiés avec Nginx
              </p>
            </div>

            <CodeBlock code={nginxCode} language="nginx" />

            <div className="space-y-3">
              <Step number={1} title="Éditer la configuration Nginx">
                <p>
                  Ouvrez votre fichier de configuration (généralement{" "}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">/etc/nginx/sites-available/votre-site</code>).
                </p>
              </Step>

              <Step number={2} title="Ajouter le code">
                <p>Ajoutez le code ci-dessus dans votre bloc <code>server {"{}"}</code>.</p>
              </Step>

              <Step number={3} title="Tester et recharger">
                <div className="space-y-1 font-mono text-xs">
                  <code className="block p-2 rounded bg-muted/50">sudo nginx -t</code>
                  <code className="block p-2 rounded bg-muted/50">sudo systemctl reload nginx</code>
                </div>
              </Step>
            </div>
          </TabsContent>

          {/* Apache Tab */}
          <TabsContent value="apache" className="space-y-4 mt-0">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <Globe className="w-5 h-5 text-red-500" />
              <p className="text-sm text-foreground font-medium">
                Apache — Pour les hébergements mutualisés ou serveurs Apache
              </p>
            </div>

            <CodeBlock code={apacheCode} language="apache" />

            <div className="space-y-3">
              <Step number={1} title="Créer/éditer le .htaccess">
                <p>
                  Créez ou éditez le fichier <code className="px-1 py-0.5 rounded bg-muted text-xs">.htaccess</code> à la racine de votre site.
                </p>
              </Step>

              <Step number={2} title="Coller le code">
                <p>Ajoutez le code ci-dessus dans votre fichier .htaccess.</p>
              </Step>

              <Step number={3} title="Vérifier mod_proxy">
                <p>
                  Assurez-vous que <code className="px-1 py-0.5 rounded bg-muted text-xs">mod_proxy</code> est activé sur votre serveur Apache.
                </p>
              </Step>
            </div>
          </TabsContent>

          {/* Express Tab */}
          <TabsContent value="express" className="space-y-4 mt-0">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <FileCode className="w-5 h-5 text-yellow-500" />
              <p className="text-sm text-foreground font-medium">
                Node.js / Express — Pour les applications Express.js
              </p>
            </div>

            <CodeBlock code={expressCode} language="javascript" />

            <div className="space-y-3">
              <Step number={1} title="Créer le middleware">
                <p>
                  Créez un fichier <code className="px-1 py-0.5 rounded bg-muted text-xs">prerender.js</code> et collez le code ci-dessus.
                </p>
              </Step>

              <Step number={2} title="Importer dans votre app">
                <code className="block p-2 rounded bg-muted/50 text-xs font-mono">
                  {`const prerenderMiddleware = require('./prerender');
app.use(prerenderMiddleware);`}
                </code>
              </Step>

              <Step number={3} title="Redémarrer l'application">
                <p>Redémarrez votre serveur Node.js pour appliquer les changements.</p>
              </Step>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Help Section */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
          <p className="text-xs text-muted-foreground">
            Si vous utilisez une autre plateforme (Vercel, Netlify, etc.) ou avez besoin d'assistance,
            contactez-nous et nous vous aiderons à configurer le prerendering.
          </p>
        </div>
      </div>
    </div>
  );
}
