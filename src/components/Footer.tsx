import { Link } from "react-router-dom";
import { Terminal, Github, Twitter } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <span className="font-mono font-semibold text-lg text-foreground">
                seo<span className="text-primary">_</span>lovable
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed font-mono">
              {t("footer.desc")}
            </p>
            
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono font-semibold text-foreground mb-4 text-sm">{t("footer.product")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
                {t("nav.home")}
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
                {t("nav.how")}
              </Link>
              <Link to="/pricing" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
                {t("nav.pricing")}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono font-semibold text-foreground mb-4 text-sm">{t("footer.legal")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/auth" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
                {t("nav.login")}
              </Link>
              <Link to="#" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
                {t("footer.privacy")}
              </Link>
              <Link to="#" className="text-muted-foreground text-sm hover:text-primary transition-colors font-mono">
                {t("footer.terms")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs font-mono">
            © 2025 SEO Lovable
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
