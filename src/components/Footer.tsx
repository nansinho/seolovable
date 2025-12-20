import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/50 bg-card/30 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-sm">
            <Link to="/" className="font-bold text-xl text-foreground font-display">
              SEO Lovable
            </Link>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {t("footer.desc")}
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              support@seo-lovable.com
            </p>
          </div>

          <div className="flex gap-20">
            <div>
              <h4 className="font-semibold text-foreground mb-5 text-sm font-display">{t("footer.product")}</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors underline-animate">
                  {t("nav.home")}
                </Link>
                <Link to="/how-it-works" className="text-muted-foreground text-sm hover:text-foreground transition-colors underline-animate">
                  {t("nav.how")}
                </Link>
                <Link to="/pricing" className="text-muted-foreground text-sm hover:text-foreground transition-colors underline-animate">
                  {t("nav.pricing")}
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-5 text-sm font-display">{t("footer.legal")}</h4>
              <nav className="flex flex-col gap-3">
                <Link to="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors underline-animate">
                  {t("footer.privacy")}
                </Link>
                <Link to="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors underline-animate">
                  {t("footer.terms")}
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm font-mono">© 2025 SEO Lovable</p>
          <p className="text-muted-foreground text-xs">Made with precision for modern web apps</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
