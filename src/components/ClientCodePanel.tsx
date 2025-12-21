import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

interface ClientCodePanelProps {
  token: string;
}

export function ClientCodePanel({ token }: ClientCodePanelProps) {
  const [copied, setCopied] = useState(false);

  const middlewareCode = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BOT_USER_AGENTS = [
  /googlebot/i,
  /bingbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /discordbot/i,
  /yandex/i,
  /baiduspider/i,
  /applebot/i,
  /duckduckbot/i,
];

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Skip if already prerendered or not a bot
  if (userAgent.includes('Prerender') || !BOT_USER_AGENTS.some(regex => regex.test(userAgent))) {
    return NextResponse.next();
  }

  const token = '${token}';
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  
  const prerenderUrl = \`https://prerender.seolovable.cloud/\${token}/\${host}\${pathname}\${search}\`;
  
  return NextResponse.rewrite(new URL(prerenderUrl));
}

export const config = {
  matcher: '/:path*'
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(middlewareCode);
    setCopied(true);
    toast.success("Code copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">middleware.ts</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copié
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copier
            </>
          )}
        </Button>
      </div>

      <div className="relative">
        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto max-h-[300px]">
          <code>{middlewareCode}</code>
        </pre>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm">
        <p className="font-medium text-blue-400 mb-2">Instructions :</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
          <li>Va dans le projet Lovable du client</li>
          <li>Dis à Lovable : "Ajoute un fichier middleware.ts à la racine avec ce code exact :"</li>
          <li>Colle le code ci-dessus</li>
          <li>Lovable redéploiera automatiquement</li>
        </ol>
      </div>
    </div>
  );
}
