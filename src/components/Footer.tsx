import { Link } from "react-router-dom";
import { Zap, Twitter, Github, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                SEO Lovable
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Prerender pour tous les sites Lovable qui n'ont pas un SEO optimisé. 
              Rendez votre contenu visible pour Google, ChatGPT, Claude et Perplexity.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Produit</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Comment ça marche
              </Link>
              <Link to="/pricing" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Tarifs
              </Link>
              <Link to="/dashboard" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Légal</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/auth" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Connexion
              </Link>
              <Link to="/legal" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Mentions légales
              </Link>
              <Link to="/privacy" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                CGV
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 SEO Lovable – Prerender pour tous les sites Lovable
          </p>
          <p className="text-muted-foreground text-xs">
            Fait avec ❤️ pour la communauté Lovable
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
