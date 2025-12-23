import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, CheckCircle, Cloud, Server, Globe, FileCode, Code2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface IntegrationGuideProps {
  prerenderToken: string;
  siteUrl: string;
}

export function IntegrationGuide({ prerenderToken, siteUrl }: IntegrationGuideProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  let domain = "";
  try {
    domain = new URL(siteUrl).hostname;
  } catch {
    domain = siteUrl;
  }

  const backendUrl = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Masquer le token dans le code affiché
  const maskedToken = "••••••••••••••••";
  const displayToken = showToken ? prerenderToken : maskedToken;

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(prerenderToken);
    setCopiedToken(true);
    toast.success("Token copié !");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCode = async (code: string, id: string) => {
    // Toujours copier avec le vrai token
    const codeWithRealToken = code.replace(maskedToken, prerenderToken);
    await navigator.clipboard.writeText(codeWithRealToken);
    setCopiedCode(id);
    toast.success("Code copié avec le token !");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const cloudflareCode = `// SEOLovable - Cloudflare Worker
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'GPTBot', 'ChatGPT-User',
  'anthropic-ai', 'Claude-Web', 'PerplexityBot'
];

const PRERENDER_SERVICE = 'https://prerender.seolovable.fr';
const PRERENDER_TOKEN = '${displayToken}';
const LOG_ENDPOINT = '${backendUrl}/functions/v1/log-prerender';
const API_KEY = '${publishableKey}';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  
  const isBot = BOT_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (!isBot) return fetch(request);
  
  const prerenderUrl = \`\${PRERENDER_SERVICE}/\${encodeURIComponent(url.toString())}?token=\${PRERENDER_TOKEN}\`;
  const response = await fetch(prerenderUrl);
  
  return new Response(response.body, {
    status: response.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}`;

  const nginxCode = `# SEOLovable - Nginx
map $http_user_agent $is_bot {
    default 0;
    ~*googlebot 1;
    ~*bingbot 1;
    ~*GPTBot 1;
    ~*ChatGPT 1;
    ~*anthropic 1;
    ~*Claude 1;
}

location / {
    if ($is_bot) {
        set $prerender_url "https://prerender.seolovable.fr/$scheme://$host$request_uri?token=${displayToken}";
        proxy_pass $prerender_url;
        break;
    }
    try_files $uri $uri/ /index.html;
}`;

  const apacheCode = `# SEOLovable - Apache (.htaccess)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTP_USER_AGENT} (googlebot|bingbot|GPTBot|ChatGPT|anthropic|Claude) [NC]
    RewriteCond %{REQUEST_URI} !\\.(js|css|png|jpg|gif|ico|svg)$
    RewriteRule ^(.*)$ https://prerender.seolovable.fr/%{REQUEST_SCHEME}://%{HTTP_HOST}/$1?token=${displayToken} [P,L]
</IfModule>`;

  const expressCode = `// SEOLovable - Express.js Middleware
const BOT_AGENTS = ['googlebot', 'bingbot', 'GPTBot', 'ChatGPT', 'anthropic', 'Claude'];
const PRERENDER_TOKEN = '${displayToken}';

function prerenderMiddleware(req, res, next) {
  const userAgent = req.get('User-Agent') || '';
  const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  
  if (!isBot) return next();
  
  const targetUrl = \`\${req.protocol}://\${req.get('host')}\${req.originalUrl}\`;
  const prerenderUrl = \`https://prerender.seolovable.fr/\${encodeURIComponent(targetUrl)}?token=\${PRERENDER_TOKEN}\`;
  
  fetch(prerenderUrl)
    .then(response => response.text())
    .then(html => res.set('Content-Type', 'text/html').send(html))
    .catch(() => next());
}

module.exports = prerenderMiddleware;`;

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopyCode(code, id)}
        className="absolute top-2 right-2 z-10 font-code text-xs h-7"
      >
        {copiedCode === id ? (
          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
        ) : (
          <Copy className="w-3 h-3 mr-1" />
        )}
        Copier
      </Button>
      <ScrollArea className="h-[200px]">
        <pre className="p-4 rounded-lg bg-zinc-950 border border-border text-xs font-mono text-zinc-300 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Token Section */}
      <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-accent" />
            <h3 className="font-code font-semibold text-foreground">Token Prerender</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToken(!showToken)}
            className="h-8 text-xs font-code"
          >
            {showToken ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showToken ? "Masquer" : "Afficher"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 rounded-lg bg-muted font-code text-sm text-foreground break-all border border-border">
            {displayToken}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopyToken} className="h-9 w-9 shrink-0">
            {copiedToken ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-code">
          ⚠️ Ne partagez jamais ce token. Le bouton "Copier" copie le token réel.
        </p>
      </div>

      {/* Integration Tabs */}
      <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-accent" />
          <h3 className="font-code font-semibold text-foreground">Guide d'intégration</h3>
        </div>

        <Tabs defaultValue="cloudflare" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-muted/50 rounded-lg mb-4">
            <TabsTrigger value="cloudflare" className="font-code text-xs py-2">
              <Cloud className="w-4 h-4 mr-1 hidden sm:inline" />
              Cloudflare
            </TabsTrigger>
            <TabsTrigger value="nginx" className="font-code text-xs py-2">
              <Server className="w-4 h-4 mr-1 hidden sm:inline" />
              Nginx
            </TabsTrigger>
            <TabsTrigger value="apache" className="font-code text-xs py-2">
              <Globe className="w-4 h-4 mr-1 hidden sm:inline" />
              Apache
            </TabsTrigger>
            <TabsTrigger value="express" className="font-code text-xs py-2">
              <FileCode className="w-4 h-4 mr-1 hidden sm:inline" />
              Node.js
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloudflare" className="mt-0">
            <CodeBlock code={cloudflareCode} id="cloudflare" />
          </TabsContent>

          <TabsContent value="nginx" className="mt-0">
            <CodeBlock code={nginxCode} id="nginx" />
          </TabsContent>

          <TabsContent value="apache" className="mt-0">
            <CodeBlock code={apacheCode} id="apache" />
          </TabsContent>

          <TabsContent value="express" className="mt-0">
            <CodeBlock code={expressCode} id="express" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
