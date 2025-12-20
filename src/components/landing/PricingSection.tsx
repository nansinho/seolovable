import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, Crown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const PLAN_COLORS = {
  starter: {
    icon: Zap,
    bgLight: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  pro: {
    icon: Crown,
    bgLight: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/30",
    button: "bg-accent hover:bg-accent/90 text-accent-foreground",
  },
  business: {
    icon: Building2,
    bgLight: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    button: "bg-purple-500 hover:bg-purple-600 text-white",
  },
};

export const PricingSection = () => {
  const { t } = useI18n();

  const plans = [
    {
      id: "starter",
      name: t("plan.starter"),
      price: "29€",
      period: "/mois",
      description: t("plan.starter.desc"),
      features: [
        t("plan.starter.f1"),
        t("plan.starter.f2"),
        t("plan.starter.f3"),
        t("plan.starter.f4"),
        t("plan.starter.f5"),
      ],
      popular: false,
    },
    {
      id: "pro",
      name: t("plan.pro"),
      price: "59€",
      period: "/mois",
      description: t("plan.pro.desc"),
      features: [
        t("plan.pro.f1"),
        t("plan.pro.f2"),
        t("plan.pro.f3"),
        t("plan.pro.f4"),
        t("plan.pro.f5"),
        t("plan.pro.f6"),
      ],
      popular: true,
    },
    {
      id: "business",
      name: t("plan.business"),
      price: "99€",
      period: "/mois",
      description: t("plan.business.desc"),
      features: [
        t("plan.business.f1"),
        t("plan.business.f2"),
        t("plan.business.f3"),
        t("plan.business.f4"),
        t("plan.business.f5"),
        t("plan.business.f6"),
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4 opacity-0 animate-fade-in"
          >
            {t("pricing.title")}
          </h2>
          <p 
            className="text-muted-foreground font-mono max-w-xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const colors = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS];
            const Icon = colors?.icon || Zap;
            
            return (
              <div
                key={index}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all duration-300 opacity-0 animate-fade-in-up",
                  plan.popular
                    ? "bg-card border-accent shadow-lg shadow-accent/10 scale-105 z-10"
                    : "bg-card/50 backdrop-blur-sm border-border hover:border-accent/30"
                )}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-mono font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    {t("pricing.popular")}
                  </span>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      colors?.bgLight
                    )}>
                      <Icon className={cn("w-5 h-5", colors?.text)} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      {plan.price.replace("€", "")}
                    </span>
                    <span className="text-xl text-muted-foreground">€</span>
                    <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        colors?.bgLight
                      )}>
                        <Check className={cn("w-3 h-3", colors?.text)} />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth?mode=signup" className="block">
                  <Button
                    className={cn(
                      "w-full h-12 font-semibold group",
                      colors?.button
                    )}
                  >
                    {t("pricing.cta")}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div 
          className="flex flex-wrap justify-center items-center gap-8 mt-12 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono">{t("pricing.cancel")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono">{t("pricing.refund")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono">{t("pricing.trial")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
