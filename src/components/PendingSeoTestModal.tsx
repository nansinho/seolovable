import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  onComplete 
}: PendingSeoTestModalProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && url && userEmail) {
      runTest();
    }
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
        toast.success("Analyse SEO terminée !");
      } else {
        setError(data.error || "Erreur lors de l'analyse");
      }
    } catch (err) {
      console.error("Test error:", err);
      setError("Erreur lors de l'analyse. Réessayez plus tard.");
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
            Analyse SEO
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
            <p className="text-xs text-muted-foreground font-code">Site analysé</p>
            <p className="text-sm font-code text-foreground truncate">{url}</p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-sm font-code text-muted-foreground">Analyse en cours...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
              <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-code text-foreground">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 font-code"
                onClick={runTest}
              >
                Réessayer
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Score global */}
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-code text-muted-foreground">Score SEO</span>
                  <span className={`text-3xl font-bold font-code ${getScoreColor(result.score || 0)}`}>
                    {result.score || 0}/100
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (result.score || 0) >= 75 ? "bg-green-500" :
                      (result.score || 0) >= 50 ? "bg-yellow-500" : "bg-destructive"
                    }`}
                    style={{ width: `${result.score || 0}%` }}
                  />
                </div>
              </div>

              {/* Détails SEO */}
              {result.seo && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasTitle ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">Balise title</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasMetaDescription ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">Meta description</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasH1 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">Balise H1</span>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border flex items-center gap-2">
                    {result.seo.hasCanonical ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-code text-foreground">Canonical</span>
                  </div>
                </div>
              )}

              {/* Recommandation prerender */}
              {result.needsPrerender && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-code text-foreground font-semibold mb-1">
                        Votre site a besoin de prerendering
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ajoutez votre site pour améliorer son indexation par les moteurs de recherche.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats techniques */}
              {result.responseTime && (
                <div className="text-xs text-muted-foreground font-code text-center">
                  Temps de réponse: {result.responseTime}ms
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={handleClose} className="font-code">
            Fermer
          </Button>
          {result?.needsPrerender && (
            <Button onClick={handleClose} className="font-code">
              Ajouter mon site
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};