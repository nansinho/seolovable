import { Terminal } from "@/components/Terminal";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const ProblemSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-card" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-foreground mb-4 opacity-0 animate-fade-in"
          >
            {t("problem.title1")}{" "}
            <span className="text-primary border border-primary px-3 py-1">{t("problem.title2")}</span>
          </h2>
          <p 
            className="text-muted-foreground font-mono max-w-2xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {t("problem.subtitle")}
          </p>
        </div>

        <div 
          className="max-w-3xl mx-auto opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="p-8 rounded-lg bg-background border border-border">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-md bg-destructive/10 border border-destructive/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                {t("problem.desc")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-3">{t("problem.bots")}</p>
                <Terminal title="crawler-view.html">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">{"<html>"}</p>
                    <p className="text-muted-foreground pl-2">{"<body>"}</p>
                    <p className="text-destructive pl-4">{"<div id=\"root\"></div>"}</p>
                    <p className="text-muted-foreground pl-2">{"</body>"}</p>
                    <p className="text-muted-foreground">{"</html>"}</p>
                  </div>
                </Terminal>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-3">{t("problem.indexed")}</p>
                <Terminal title="rendered-view.html" className="border-primary/30">
                  <div className="space-y-1">
                    <p className="text-primary">{"<h1>Page Title</h1>"}</p>
                    <p className="text-primary">{"<nav>Menu...</nav>"}</p>
                    <p className="text-primary">{"<main>Content...</main>"}</p>
                    <p className="text-primary">{"<footer>Links...</footer>"}</p>
                  </div>
                </Terminal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
