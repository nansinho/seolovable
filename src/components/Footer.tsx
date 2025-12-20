import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Link to="/" className="font-semibold text-lg text-foreground">
              SEO Lovable
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              {t("footer.desc")}
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm">{t("footer.product")}</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                  {t("nav.home")}
                </Link>
                <Link to="/how-it-works" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                  {t("nav.how")}
                </Link>
                <Link to="/pricing" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                  {t("nav.pricing")}
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm">{t("footer.legal")}</h4>
              <nav className="flex flex-col gap-2">
                <Link to="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                  {t("footer.privacy")}
                </Link>
                <Link to="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                  {t("footer.terms")}
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6">
          <p className="text-muted-foreground text-sm">
            © 2025 SEO Lovable
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
