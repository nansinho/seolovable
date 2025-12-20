import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TypingText } from "@/components/TypingText";
import { Terminal } from "@/components/Terminal";
import { Globe3D } from "@/components/Globe3D";
import { ArrowRight, Sparkles, Play } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-blue-dark/20" />
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-float" />
      
      {/* 3D Globe Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 pointer-events-none hidden lg:block">
        <Globe3D className="w-full h-full" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass shimmer opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">
                Nouveau : Intégration AI pour optimisation contenu
              </span>
            </div>

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-display leading-tight opacity-0 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-foreground">Boostez le SEO de votre site</span>{" "}
              <span className="gradient-text">Lovable en 5 minutes</span>
            </h1>

            <p 
              className="text-lg text-muted-foreground leading-relaxed max-w-xl opacity-0 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Votre Lovable est génial mais invisible pour Google ? Notre prerender rend tout 
              votre contenu HTML crawlable pour <span className="text-primary font-medium">Google</span>, 
              <span className="text-secondary font-medium"> ChatGPT</span>, 
              <span className="text-secondary font-medium"> Claude</span> et 
              <span className="text-secondary font-medium"> Perplexity</span> – sans toucher votre code.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="glow-orange group text-base px-8 py-6">
                  Trial gratuit 14 jours
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 border-border hover:border-primary/50 hover:bg-primary/5">
                  <Play className="w-4 h-4 mr-2" />
                  Voir la démo
                </Button>
              </Link>
            </div>

            <p 
              className="text-sm text-muted-foreground opacity-0 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              ✓ Pas de carte requise · ✓ Setup en 5 min · ✓ Annulation facile
            </p>

            {/* Stats */}
            <div 
              className="flex items-center gap-10 pt-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div>
                <p className="text-3xl font-display font-bold gradient-text">+200%</p>
                <p className="text-sm text-muted-foreground">Trafic SEO</p>
              </div>
              <div className="w-px h-14 bg-border" />
              <div>
                <p className="text-3xl font-display font-bold text-secondary">5 min</p>
                <p className="text-sm text-muted-foreground">Configuration</p>
              </div>
              <div className="w-px h-14 bg-border" />
              <div>
                <p className="text-3xl font-display font-bold text-turquoise">100%</p>
                <p className="text-sm text-muted-foreground">Indexable</p>
              </div>
            </div>
          </div>

          {/* Right side - Terminals */}
          <div 
            className="space-y-6 opacity-0 animate-slide-in-right" 
            style={{ animationDelay: "0.4s" }}
          >
            {/* Before */}
            <Terminal title="avant-prerender.html" className="opacity-80">
              <div className="space-y-2 font-mono text-sm">
                <p className="text-destructive">{"<!-- Ce que Google voit -->"}</p>
                <p className="text-muted-foreground">{"<div id=\"root\"></div>"}</p>
                <p className="text-muted-foreground">{"<script src=\"/bundle.js\"></script>"}</p>
                <p className="text-destructive">{"<!-- Aucun contenu indexable ❌ -->"}</p>
              </div>
            </Terminal>

            {/* After */}
            <Terminal title="après-seo-lovable.html" className="border-primary/50 glow-orange">
              <div className="space-y-2 font-mono text-sm">
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
