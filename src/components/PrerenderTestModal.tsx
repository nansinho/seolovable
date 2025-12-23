import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, Code, Eye, FileText, CheckCircle, XCircle, Clock, HardDrive } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";

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

export const PrerenderTestModal = ({ open, onOpenChange, defaultUrl = "" }: PrerenderTestModalProps) => {
  const { t } = useI18n();

  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrerenderResult | null>(null);

  const handleTest = async () => {
    if (!url) {
      toast.error(t("prerenderTest.enterUrl"));
      return;
    }

    let testUrl = url;
    if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
      testUrl = "https://" + testUrl;
    }

    setLoading(true);
    setResult(null);

    const TIMEOUT_MS = 25_000;

    try {
      const invokePromise = supabase.functions.invoke("test-prerender", {
        body: { url: testUrl },
      });

      const { data, error } = await Promise.race([
        invokePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout après ${Math.round(TIMEOUT_MS / 1000)}s`)), TIMEOUT_MS)
        ),
      ]);

      if (error) throw error;

      setResult(data);

      if (data.success) toast.success(t("prerenderTest.successToast"));
      else toast.error(data.error || t("prerenderTest.failToast"));
    } catch (error) {
      console.error("Prerender test error:", error);
      const message = error instanceof Error ? error.message : t("prerenderTest.unknownError");
      toast.error(message);
      setResult({
        success: false,
        html: "",
        status: 0,
        renderTime: 0,
        title: "",
        description: "",
        size: "0",
        error: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleTest();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-code flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            {t("prerenderTest.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-code"
            />
            <Button onClick={handleTest} disabled={loading} className="font-code glow-green min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("prerenderTest.testing")}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t("prerenderTest.test")}
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border font-code text-sm">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span>
                  {t("prerenderTest.status")} {result.status || t("common.error")}
                </span>
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

          {result && (
            <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html" className="font-code text-xs">
                  <Code className="w-4 h-4 mr-2" />
                  {t("prerenderTest.rawHtml")}
                </TabsTrigger>
                <TabsTrigger value="preview" className="font-code text-xs">
                  <Eye className="w-4 h-4 mr-2" />
                  {t("prerenderTest.preview")}
                </TabsTrigger>
                <TabsTrigger value="metadata" className="font-code text-xs">
                  <FileText className="w-4 h-4 mr-2" />
                  {t("prerenderTest.metadata")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="flex-1 min-h-0 mt-4">
                <ScrollArea className="h-[400px] rounded-lg border border-border bg-background p-4">
                  <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground">
                    {result.html || result.error || t("prerenderTest.noContent")}
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
                      title={t("prerenderTest.iframeTitle")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-code">
                      {t("prerenderTest.noPreview")}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="flex-1 min-h-0 mt-4">
                <div className="space-y-4 p-4 rounded-lg border border-border bg-background">
                  <div>
                    <label className="text-xs text-muted-foreground font-code block mb-1">Title</label>
                    <p className="font-code text-sm text-foreground bg-muted/50 p-2 rounded">
                      {result.title || t("prerenderTest.notDefined")}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-code block mb-1">Meta Description</label>
                    <p className="font-code text-sm text-foreground bg-muted/50 p-2 rounded">
                      {result.description || t("prerenderTest.notDefinedF")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">HTTP</label>
                      <p className="font-code text-lg font-bold text-primary">{result.status || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        {t("prerenderTest.renderTime")}
                      </label>
                      <p className="font-code text-lg font-bold text-primary">
                        {(result.renderTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        {t("prerenderTest.size")}
                      </label>
                      <p className="font-code text-lg font-bold text-primary">{result.size} KB</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!result && !loading && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-code text-sm">
              {t("prerenderTest.enterUrlHint")}
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground font-code text-sm">{t("prerenderTest.rendering")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
