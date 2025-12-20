import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TypingText } from "@/components/TypingText";
import { Terminal } from "@/components/Terminal";
import { ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden matrix-bg">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-code text-primary">
                Nouveau : Intégration AI pour optimisation contenu
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-code leading-tight">
              <TypingText 
                text="Boostez le SEO de votre site Lovable en 5 minutes" 
                className="text-primary"
                speed={40}
              />
            </h1>

            <p className="text-lg text-muted-foreground font-code leading-relaxed">
              Votre Lovable est génial mais invisible pour Google ? Notre prerender rend tout 
              votre contenu HTML crawlable pour <span className="text-secondary">Google</span>, 
              <span className="text-secondary"> ChatGPT</span>, 
              <span className="text-secondary"> Claude</span> et 
              <span className="text-secondary"> Perplexity</span> – sans toucher votre code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="font-code glow-green group w-full sm:w-auto">
                  Trial gratuit 14 jours
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground font-code self-center">
                Pas de carte requise
              </p>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-code">+200%</p>
                <p className="text-xs text-muted-foreground font-code">Trafic SEO</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-code">5 min</p>
                <p className="text-xs text-muted-foreground font-code">Configuration</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-code">100%</p>
                <p className="text-xs text-muted-foreground font-code">Indexable</p>
              </div>
            </div>
          </div>

          {/* Right side - Split screen terminals */}
          <div className="space-y-4 animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
            {/* Before - JS Empty */}
            <Terminal title="avant-prerender.html" className="opacity-60">
              <div className="space-y-2">
                <p className="text-destructive">{"<!-- Ce que Google voit -->"}</p>
                <p className="text-muted-foreground">{"<div id=\"root\"></div>"}</p>
                <p className="text-muted-foreground">{"<script src=\"/bundle.js\"></script>"}</p>
                <p className="text-destructive">{"<!-- Aucun contenu indexable ❌ -->"}</p>
              </div>
            </Terminal>

            {/* After - HTML Complete */}
            <Terminal title="après-seo-lovable.html" className="glow-green">
              <div className="space-y-2">
                <p className="text-primary">{"<!-- Ce que Google voit maintenant -->"}</p>
                <p className="text-muted-foreground">{"<div id=\"root\">"}</p>
                <p className="text-secondary pl-4">{"<header>Navigation...</header>"}</p>
                <p className="text-secondary pl-4">{"<main>"}</p>
                <p className="text-primary pl-8">{"<h1>Votre titre SEO</h1>"}</p>
                <p className="text-primary pl-8">{"<p>Tout votre contenu...</p>"}</p>
                <p className="text-secondary pl-4">{"</main>"}</p>
                <p className="text-muted-foreground">{"</div>"}</p>
                <p className="text-primary">{"<!-- 100% indexable ✅ -->"}</p>
              </div>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;