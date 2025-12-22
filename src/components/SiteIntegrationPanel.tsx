import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Code, Terminal } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface SiteIntegrationPanelProps {
  prerenderToken: string;
}

export function SiteIntegrationPanel({ prerenderToken }: SiteIntegrationPanelProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { t } = useI18n();

  const middlewareCode = `// middleware.ts - Place at the root of your Next.js project
import { NextRequest, NextResponse } from 'next/server';

const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'duckduckbot',
  'slurp', 'facebookexternalhit', 'linkedinbot', 'twitterbot',
  'applebot', 'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
  'petalbot', 'rogerbot', 'screaming frog', 'ia_archiver',
  'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai', 'cohere-ai',
  'perplexitybot', 'youbot', 'google-extended'
];

const PRERENDER_TOKEN = '${prerenderToken}';
const PRERENDER_URL = 'https://prerender.seolovable.fr';

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  if (!isBot(userAgent)) {
    return NextResponse.next();
  }

  try {
    const targetUrl = request.url;
    const prerenderUrl = \`\${PRERENDER_URL}/\${encodeURIComponent(targetUrl)}?token=\${PRERENDER_TOKEN}\`;
    
    const response = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': PRERENDER_TOKEN,
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      return NextResponse.next();
    }

    const html = await response.text();
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerendered': 'true',
      },
    });
  } catch (error) {
    console.error('Prerender error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};`;

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(prerenderToken);
    setCopiedToken(true);
    toast.success(t("integration.tokenCopied") || "Token copié");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(middlewareCode);
    setCopiedCode(true);
    toast.success(t("integration.codeCopied") || "Code copié");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-accent" />
        <h3 className="text-base font-semibold font-code text-foreground">
          {t("integration.title") || "Intégration Prerender"}
        </h3>
      </div>

      {/* Token Section */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground font-code block mb-2">
          {t("integration.yourToken") || "Votre token Prerender"}
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 rounded bg-muted font-mono text-sm text-foreground break-all">
            {prerenderToken}
          </code>
          <Button variant="ghost" size="sm" onClick={handleCopyToken}>
            {copiedToken ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Middleware Code Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground font-code flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            middleware.ts
          </label>
          <Button variant="ghost" size="sm" onClick={handleCopyCode} className="font-code text-xs">
            {copiedCode ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                {t("integration.copied") || "Copié"}
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                {t("integration.copyCode") || "Copier le code"}
              </>
            )}
          </Button>
        </div>
        <div className="relative">
          <pre className="p-4 rounded-lg bg-muted/50 border border-border overflow-x-auto text-xs font-mono text-foreground max-h-64 overflow-y-auto">
            {middlewareCode}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground font-code">
          <span className="text-foreground font-medium">
            {t("integration.instructions") || "Instructions :"}
          </span>{" "}
          {t("integration.instructionsDetail") || 
            "Copiez ce fichier middleware.ts à la racine de votre projet Next.js. Il détectera automatiquement les bots et servira le contenu prérendu."}
        </p>
      </div>
    </div>
  );
}
