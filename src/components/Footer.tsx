import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="relative border-t border-border/50 py-20 tech-line overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_100%,hsl(var(--primary)/0.1),transparent)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                <span className="font-display font-bold text-primary text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-foreground tracking-tight">
                  SEO LOVABLE
                </span>
                <span className="text-[10px] tracking-[0.3em] text-primary font-mono">
                  PRERENDER
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("footer.desc")}
            </p>
            <p className="text-sm text-primary font-mono">
              contact@seo-lovable.com
            </p>
          </div>

          <div className="flex gap-20">
            <div>
              <h4 className="font-display font-bold text-foreground mb-6 text-sm tracking-wide uppercase">
                {t("footer.product")}
              </h4>
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {t("nav.home")}
                </Link>
                <Link to="/how-it-works" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {t("nav.how")}
                </Link>
                <Link to="/pricing" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {t("nav.pricing")}
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-display font-bold text-foreground mb-6 text-sm tracking-wide uppercase">
                {t("footer.legal")}
              </h4>
              <nav className="flex flex-col gap-4">
                <Link to="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {t("footer.privacy")}
                </Link>
                <Link to="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-16 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm font-mono">
            © 2025 SEO LOVABLE
          </p>
          <p className="text-muted-foreground text-xs">
            Built for the future of web
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
