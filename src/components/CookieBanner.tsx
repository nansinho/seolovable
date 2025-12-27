import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, BarChart3, Settings } from "lucide-react";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in">
      <div className="container mx-auto max-w-3xl">
        <div className="relative bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Paramètres de confidentialité
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gérez vos préférences de cookies
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Nous utilisons des cookies pour améliorer votre expérience de navigation et analyser notre trafic. 
              Vous pouvez choisir d'accepter tous les cookies ou uniquement ceux essentiels au fonctionnement du site.
            </p>

            {/* Cookie categories (collapsible) */}
            {showDetails && (
              <div className="mb-5 space-y-3 animate-fade-in">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Essentiels</p>
                    <p className="text-xs text-muted-foreground">Nécessaires au fonctionnement du site. Toujours actifs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Analytiques</p>
                    <p className="text-xs text-muted-foreground">Nous aident à comprendre comment vous utilisez le site.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button 
                onClick={acceptAll} 
                className="flex-1 sm:flex-none font-medium"
                size="default"
              >
                Accepter tout
              </Button>
              <Button 
                onClick={acceptEssential} 
                variant="outline" 
                className="flex-1 sm:flex-none font-medium"
                size="default"
              >
                Essentiels uniquement
              </Button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <Settings className="w-4 h-4" />
                <span>{showDetails ? "Masquer" : "Détails"}</span>
              </button>
            </div>

            {/* Legal link */}
            <p className="mt-4 text-xs text-muted-foreground text-center sm:text-left">
              En savoir plus dans notre{" "}
              <a 
                href="/confidentialite" 
                className="text-primary hover:underline underline-offset-2"
              >
                politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
