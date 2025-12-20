import { Zap, Globe2, BarChart3, Shield, Clock, Bot } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const FeaturesSection = () => {
  const { t } = useI18n();

  const features = [
    {
      icon: Zap,
      title: t("feature.1.title"),
      description: t("feature.1.desc"),
    },
    {
      icon: Globe2,
      title: t("feature.2.title"),
      description: t("feature.2.desc"),
    },
    {
      icon: BarChart3,
      title: t("feature.3.title"),
      description: t("feature.3.desc"),
    },
    {
      icon: Shield,
      title: t("feature.4.title"),
      description: t("feature.4.desc"),
    },
    {
      icon: Clock,
      title: t("feature.5.title"),
      description: t("feature.5.desc"),
    },
    {
      icon: Bot,
      title: t("feature.6.title"),
      description: t("feature.6.desc"),
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-card" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4 opacity-0 animate-fade-in"
          >
            {t("features.title")}
          </h2>
          <p 
            className="text-muted-foreground font-mono max-w-xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-background border border-border card-hover opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-mono font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
