import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface TestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number;
  seo?: {
    hasTitle: boolean;
    hasMetaDescription: boolean;
    hasH1: boolean;
    hasCanonical: boolean;
  };
  needsPrerender?: boolean;
  score?: number;
  error?: string;
}

interface PendingSeoTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  userEmail: string;
  onComplete: () => void;
}

export const PendingSeoTestModal = ({
  open,
  onOpenChange,
  url,
  userEmail,
  onComplete,
}: PendingSeoTestModalProps) => {
  const { t } = useI18n();

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && url && userEmail) runTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, url, userEmail]);

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("landing-test", {
        body: { email: userEmail, url },
      });

      if (fnError) throw fnError;

      if (data.success) {
        setResult(data.result);
        toast.success(t("seoTest.toastSuccess"));
      } else {
        setError(data.error || t("seoTest.error"));
      }
    } catch (err) {
      console.error("Test error:", err);
      setError(t("seoTest.errorLater"));
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-destructive";
  };

  const handleClose = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-code flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            {t("seoTest.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
            <p className="text-xs text-muted-foreground font-code">{t("seoTest.siteAnalyzed")}</p>
            <p className="text-sm font-code text-foreground truncate">{url}</p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-sm font-code text-muted-foreground">{t("seoTest.loading")}</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
              <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-code text-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-3 font-code" onClick={runTest}>
                {t("seoTest.retry")}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-code text-muted-foreground">{t("seoTest.score")}</span>
                  <span className={`text-3xl font-bold font-code ${getScoreColor(result.score || 0)}`}>
                    {result.score || 0}/100
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${(result.score || 0) >= 75 ? "bg-green-500" : (result.score || 0) >= 50 ? "bg-yellow-500" : "bg-destructive"}`}
                    style={{ width: `${result.score || 0}%` }}
                  />
                </div>
              </div>

              {result.seo && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasTitle ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">{t("seoTest.titleTag")}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasMetaDescription ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">{t("seoTest.metaDescription")}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasH1 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">{t("seoTest.h1Tag")}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasCanonical ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">{t("seoTest.canonical")}</span>
                  </div>
                </div>
              )}

              {result.needsPrerender && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-code text-foreground font-semibold mb-1">
                        {t("seoTest.needsPrerenderTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("seoTest.needsPrerenderDesc")}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.responseTime && (
                <div className="text-xs text-muted-foreground font-code text-center">
                  {t("seoTest.responseTime")} {result.responseTime}ms
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={handleClose} className="font-code">
            {t("seoTest.close")}
          </Button>
          {result?.needsPrerender && (
            <Button onClick={handleClose} className="font-code">
              {t("seoTest.addMySite")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
