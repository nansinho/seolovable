import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Play,
  Code,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrerenderTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUrl?: string;
}

interface PrerenderResult {
  success: boolean;
  html: string;
  status: number;
  renderTime: number;
  title: string;
  description: string;
  size: string;
  error?: string;
}

export const PrerenderTestModal = ({
  open,
  onOpenChange,
  defaultUrl = "",
}: PrerenderTestModalProps) => {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrerenderResult | null>(null);

  const handleTest = async () => {
    if (!url) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    // Add https:// if missing
    let testUrl = url;
    if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
      testUrl = "https://" + testUrl;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("test-prerender", {
        body: { url: testUrl },
      });

      if (error) throw error;

      setResult(data);

      if (data.success) {
        toast.success("Prerendering réussi !");
      } else {
        toast.error(data.error || "Échec du prerendering");
      }
    } catch (error) {
      console.error("Prerender test error:", error);
      toast.error("Erreur lors du test");
      setResult({
        success: false,
        html: "",
        status: 0,
        renderTime: 0,
        title: "",
        description: "",
        size: "0",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleTest();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-code flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Tester le Prerendering
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-code"
            />
            <Button
              onClick={handleTest}
              disabled={loading}
              className="font-code glow-green min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Tester
                </>
              )}
            </Button>
          </div>

          {/* Status Bar */}
          {result && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border font-code text-sm">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span>Status: {result.status || "Erreur"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{(result.renderTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span>{result.size} KB</span>
              </div>
            </div>
          )}

          {/* Results Tabs */}
          {result && (
            <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html" className="font-code text-xs">
                  <Code className="w-4 h-4 mr-2" />
                  HTML Brut
                </TabsTrigger>
                <TabsTrigger value="preview" className="font-code text-xs">
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="metadata" className="font-code text-xs">
                  <FileText className="w-4 h-4 mr-2" />
                  Métadonnées
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="flex-1 min-h-0 mt-4">
                <ScrollArea className="h-[400px] rounded-lg border border-border bg-background p-4">
                  <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground">
                    {result.html || result.error || "Aucun contenu"}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
                <div className="h-[400px] rounded-lg border border-border bg-background overflow-hidden">
                  {result.html ? (
                    <iframe
                      srcDoc={result.html}
                      className="w-full h-full bg-white"
                      sandbox="allow-same-origin"
                      title="Aperçu du prerendering"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-code">
                      Aucun aperçu disponible
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="flex-1 min-h-0 mt-4">
                <div className="space-y-4 p-4 rounded-lg border border-border bg-background">
                  <div>
                    <label className="text-xs text-muted-foreground font-code block mb-1">
                      Title
                    </label>
                    <p className="font-code text-sm text-foreground bg-muted/50 p-2 rounded">
                      {result.title || "Non défini"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-code block mb-1">
                      Meta Description
                    </label>
                    <p className="font-code text-sm text-foreground bg-muted/50 p-2 rounded">
                      {result.description || "Non définie"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        Status HTTP
                      </label>
                      <p className="font-code text-lg font-bold text-primary">
                        {result.status || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        Temps de rendu
                      </label>
                      <p className="font-code text-lg font-bold text-primary">
                        {(result.renderTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        Taille
                      </label>
                      <p className="font-code text-lg font-bold text-primary">
                        {result.size} KB
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Empty State */}
          {!result && !loading && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-code text-sm">
              Entrez une URL et cliquez sur "Tester" pour voir le résultat du prerendering
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground font-code text-sm">
                Rendu de la page en cours...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
