import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

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

export const LandingTestForm = () => {
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [remainingTests, setRemainingTests] = useState<number | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !url) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setRateLimited(false);

    try {
      const { data, error } = await supabase.functions.invoke("landing-test", {
        body: { email, url },
      });

      if (error) throw error;

      if (data.rateLimited) {
        setRateLimited(true);
        toast.error(data.error);
        return;
      }

      if (data.success) {
        setResult(data.result);
        setRemainingTests(data.remainingTests);
        toast.success("Test terminé !");
      } else {
        toast.error(data.error || "Erreur lors du test");
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Erreur lors du test. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-6 lg:p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-code mb-4">
            <Sparkles className="w-4 h-4" />
            Gratuit • 3 tests / jour
          </div>
          <h3 className="text-2xl font-bold font-code text-foreground mb-2">
            Testez votre site gratuitement
          </h3>
          <p className="text-muted-foreground text-sm">
            Vérifiez si votre site est bien optimisé pour les moteurs de recherche et les bots IA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-code bg-background"
              required
            />
            <Input
              type="text"
              placeholder="https://votresite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-code bg-background"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || rateLimited}
            className="w-full font-code"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                Analyser mon site
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {rateLimited && (
          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
            <AlertTriangle className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-sm font-code text-foreground mb-3">
              Limite de tests atteinte pour aujourd'hui
            </p>
            <Link to="/auth">
              <Button className="font-code">
                Créer un compte gratuit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
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
                    <p className="text-xs text-muted-foreground mb-3">
                      Les bots ne peuvent pas bien indexer votre contenu JavaScript. SEO Lovable peut résoudre ce problème.
                    </p>
                    <Link to="/auth">
                      <Button size="sm" className="font-code">
                        Commencer gratuitement
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Stats techniques */}
            {result.responseTime && (
              <div className="flex items-center justify-between text-xs text-muted-foreground font-code">
                <span>Temps de réponse: {result.responseTime}ms</span>
                {remainingTests !== null && (
                  <span>{remainingTests} tests restants aujourd'hui</span>
                )}
              </div>
            )}

            {/* CTA inscription */}
            {!result.needsPrerender && result.score !== undefined && result.score < 100 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Optimisez votre site pour les bots IA avec SEO Lovable
                </p>
                <Link to="/auth">
                  <Button variant="outline" className="font-code">
                    Créer un compte gratuit
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};