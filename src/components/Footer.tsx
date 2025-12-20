import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block text-2xl font-medium tracking-tight text-foreground hover:text-accent transition-colors">
              SEO Lovable
            </Link>
            <p className="text-muted-foreground mt-4 leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-5 uppercase tracking-wider">
                {t("footer.product")}
              </h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.home")}
                </Link>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.how")}
                </Link>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.pricing")}
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-5 uppercase tracking-wider">
                {t("footer.legal")}
              </h4>
              <nav className="flex flex-col gap-3">
                <Link to="/confidentialite" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.privacy")}
                </Link>
                <Link to="/cgv" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.terms")}
                </Link>
                <Link to="/mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.legalNotice")}
                </Link>
              </nav>
            </div>

            {/* Resources - Optional extra column */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-sm font-medium text-foreground mb-5 uppercase tracking-wider">
                {t("nav.trial")}
              </h4>
              <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium">
                {t("nav.trial")} →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 SEO Lovable. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground/60">
              Designed with precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
