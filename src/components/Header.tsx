import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  // Fermer le menu quand on change de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Empêcher le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 z-50" aria-label="SEO Lovable - Accueil">
            <span className="text-foreground font-mono font-medium tracking-tight uppercase">
              SEO Lovable
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2" role="navigation" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-mono uppercase tracking-wider transition-colors link-hover",
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="outline" size="sm" className="font-mono uppercase tracking-wider border-border h-9 px-6">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider h-9 px-6">
                {t("nav.trial")}
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 z-50 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile plein écran */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out",
          isMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isMenuOpen}
      >
        {/* Fond opaque complet */}
        <div className="absolute inset-0 bg-background" />
        
        <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <nav className="flex flex-col items-center gap-3 w-full max-w-sm" role="navigation" aria-label="Navigation mobile">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-2xl font-mono uppercase tracking-wider py-5 px-8 rounded-xl transition-all duration-300 w-full text-center",
                  location.pathname === link.href
                    ? "text-foreground bg-card border border-border"
                    : "text-foreground/80 hover:text-foreground hover:bg-card/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                aria-current={location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="w-full h-px bg-border my-8" role="separator" />
            
            <div className="flex justify-center mb-8">
              <LanguageSwitcher />
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full font-mono uppercase tracking-wider border-border h-14 text-lg">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider h-14 text-lg">
                  {t("nav.trial")}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
