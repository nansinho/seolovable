import { useState } from "react";
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

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-foreground font-mono font-medium tracking-tight uppercase">
              SEO Lovable
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
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
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="outline" size="sm" className="font-mono uppercase tracking-wider border-border min-w-[140px]">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider min-w-[140px]">
                {t("nav.trial")}
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border animate-fade-up">
            <div className="flex justify-center mb-6">
              <LanguageSwitcher />
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-sm font-mono uppercase tracking-wider py-3 px-4 rounded-lg transition-colors",
                    location.pathname === link.href
                      ? "text-foreground bg-card"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-mono uppercase tracking-wider border-border">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider">
                    {t("nav.trial")}
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
