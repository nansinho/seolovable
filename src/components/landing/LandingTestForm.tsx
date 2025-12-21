import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [remainingTests, setRemainingTests] = useState<number | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [step, setStep] = useState<"url" | "auth" | "result">("url");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Veuillez entrer l'URL de votre site");
      return;
    }
    // Passer directement à l'étape auth (Google popup)
    setStep("auth");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Store URL in sessionStorage to use after auth
      sessionStorage.setItem("pending_seo_test_url", url);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez entrer votre email");
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
        setStep("result");
        toast.error(data.error);
        return;
      }

      if (data.success) {
        setResult(data.result);
        setRemainingTests(data.remainingTests);
        setStep("result");
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

        {/* Étape 1: URL seulement */}
        {step === "url" && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="https://votresite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-code bg-background"
              required
            />
            <Button
              type="submit"
              className="w-full font-code"
              size="lg"
            >
              Analyser mon site
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* Étape 2: Google Auth */}
        {step === "auth" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 text-center mb-4">
              <p className="text-sm font-code text-foreground">
                Connectez-vous pour voir votre analyse SEO
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Site: {url}
              </p>
            </div>
            
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full font-code h-12"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </Button>
            
            <button
              type="button"
              onClick={() => setStep("url")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Modifier l'URL
            </button>
          </div>
        )}

        {step === "result" && rateLimited && (
          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
            <AlertTriangle className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-sm font-code text-foreground mb-3">
              Limite de tests atteinte pour aujourd'hui
            </p>
            <Button onClick={handleGoogleSignIn} className="font-code">
              Continuer avec Google
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
                    <Button size="sm" className="font-code" onClick={handleGoogleSignIn}>
                      Commencer gratuitement
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
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
                <Button variant="outline" className="font-code" onClick={handleGoogleSignIn}>
                  Continuer avec Google
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};