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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl shadow-[0_1px_0_hsl(var(--foreground)/0.04)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[68px]">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight text-foreground">
              SEO Lovable
            </span>
            <span className="hidden sm:inline-flex rounded-full border border-border/70 bg-card/40 px-2 py-0.5 text-[10px] tracking-[0.22em] uppercase text-muted-foreground font-mono">
              Prerender
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm transition-colors",
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons & Language */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="text-sm">
                {t("nav.trial")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex justify-center mb-4">
              <LanguageSwitcher />
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-sm py-3 px-4 rounded-md transition-colors",
                    location.pathname === link.href
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-sm">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full text-sm">
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
