import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Terminal } from "@/components/Terminal";
import { Globe3D } from "@/components/Globe3D";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      {/* Globe */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-20 pointer-events-none hidden lg:block">
        <Globe3D className="w-full h-full" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-6">
            <p 
              className="text-sm font-mono text-primary opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              // Prerender pour Lovable
            </p>

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold leading-tight opacity-0 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-foreground">Be found everywhere your audience</span>{" "}
              <span className="text-primary">searches</span>
            </h1>

            <p 
              className="text-lg text-muted-foreground leading-relaxed max-w-xl font-mono opacity-0 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Don't lose traffic because of your AI coding platform. Make your Lovable sites visible to Google, ChatGPT, Claude and Perplexity.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="font-mono group">
                  Start free trial
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="font-mono">
                  How it works
                </Button>
              </Link>
            </div>

            {/* Brand logos */}
            <div 
              className="flex flex-wrap items-center gap-8 pt-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <span className="text-xs text-muted-foreground font-mono">Trusted by:</span>
              <div className="flex items-center gap-6">
                <span className="text-muted-foreground font-mono text-sm">Google</span>
                <span className="text-muted-foreground font-mono text-sm">OpenAI</span>
                <span className="text-muted-foreground font-mono text-sm">Claude</span>
                <span className="text-muted-foreground font-mono text-sm">Perplexity</span>
              </div>
            </div>
          </div>

          {/* Terminals */}
          <div 
            className="space-y-4 opacity-0 animate-slide-in-right" 
            style={{ animationDelay: "0.4s" }}
          >
            <Terminal title="before.html" className="opacity-70">
              <div className="space-y-1.5">
                <p className="text-muted-foreground">{"<!-- What Google sees -->"}</p>
                <p className="text-muted-foreground">{"<div id=\"root\"></div>"}</p>
                <p className="text-muted-foreground">{"<script src=\"bundle.js\"></script>"}</p>
                <p className="text-destructive">{"<!-- No indexable content ❌ -->"}</p>
              </div>
            </Terminal>

            <Terminal title="after.html" className="border-primary/30 glow">
              <div className="space-y-1.5">
                <p className="text-muted-foreground">{"<!-- What Google sees now -->"}</p>
                <p className="text-foreground">{"<header>...</header>"}</p>
                <p className="text-primary">{"<h1>Your SEO title</h1>"}</p>
                <p className="text-primary">{"<p>All your content...</p>"}</p>
                <p className="text-foreground">{"<footer>...</footer>"}</p>
                <p className="text-primary">{"<!-- 100% indexable ✓ -->"}</p>
              </div>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
