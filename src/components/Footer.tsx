import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-foreground font-medium tracking-tight">
              SEO Lovable
            </Link>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-xs">
              {t("footer.desc")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              {t("footer.product")}
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors link-hover">
                {t("nav.home")}
              </Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors link-hover">
                {t("nav.how")}
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors link-hover">
                {t("nav.pricing")}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              {t("footer.legal")}
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors link-hover">
                {t("footer.privacy")}
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors link-hover">
                {t("footer.terms")}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Contact
            </h4>
            <p className="text-sm text-muted-foreground">
              contact@seo-lovable.com
            </p>
          </div>
        </div>

        <div className="elegant-line mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 SEO Lovable
          </p>
          <p className="text-sm text-muted-foreground">
            Designed with precision
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
