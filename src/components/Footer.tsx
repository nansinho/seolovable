import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <span className="font-code font-bold text-lg text-primary">
                SEO Lovable
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-code max-w-md">
              Prerender pour tous les sites Lovable qui n'ont pas un SEO optimisé. 
              Rendez votre contenu visible pour Google, ChatGPT, Claude et Perplexity.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-code font-semibold text-primary mb-4">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground text-sm font-code hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground text-sm font-code hover:text-primary transition-colors">
                Comment ça marche
              </Link>
              <Link to="/pricing" className="text-muted-foreground text-sm font-code hover:text-primary transition-colors">
                Tarifs
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-code font-semibold text-primary mb-4">Légal</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/auth" className="text-muted-foreground text-sm font-code hover:text-primary transition-colors">
                Connexion
              </Link>
              <Link to="/legal" className="text-muted-foreground text-sm font-code hover:text-primary transition-colors">
                Mentions légales
              </Link>
              <Link to="/privacy" className="text-muted-foreground text-sm font-code hover:text-primary transition-colors">
                Politique de confidentialité
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-xs font-code">
            © 2025 SEO Lovable – Prerender pour tous les sites Lovable qui n'ont pas un SEO optimisé
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;