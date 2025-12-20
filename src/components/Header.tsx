import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/how-it-works", label: "Comment ça marche" },
  { href: "/pricing", label: "Tarifs" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center group-hover:glow-green transition-all">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-code font-bold text-lg text-primary group-hover:text-glow-green transition-all">
              SEO Lovable
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "font-code text-sm transition-all hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary text-glow-green"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="font-code text-sm">
                Connexion
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="font-code text-sm glow-green">
                Essai gratuit
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "font-code text-sm py-2 transition-all",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full font-code text-sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full font-code text-sm">
                    Essai gratuit
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;