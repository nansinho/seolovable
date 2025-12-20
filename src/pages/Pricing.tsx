import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const Pricing = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      title: "Tarifs",
      subtitle: "Choisissez votre plan. Annulez quand vous voulez.",
      popular: "Populaire",
      cta: "Commencer",
      trial: "14 jours gratuits",
      plans: [
        {
          name: "Basic",
          price: "7",
          features: ["1 site", "10k pages/mois", "Support email"],
          popular: false,
        },
        {
          name: "Pro",
          price: "15",
          features: ["5 sites", "Pages illimitées", "Stats bots", "Support prioritaire"],
          popular: true,
        },
        {
          name: "Enterprise",
          price: "39",
          features: ["Sites illimités", "Rapports SEO", "Support 24/7", "API access"],
          popular: false,
        },
      ],
    },
    en: {
      title: "Pricing",
      subtitle: "Choose your plan. Cancel anytime.",
      popular: "Popular",
      cta: "Get started",
      trial: "14 days free",
      plans: [
        {
          name: "Basic",
          price: "7",
          features: ["1 site", "10k pages/month", "Email support"],
          popular: false,
        },
        {
          name: "Pro",
          price: "15",
          features: ["5 sites", "Unlimited pages", "Bot stats", "Priority support"],
          popular: true,
        },
        {
          name: "Enterprise",
          price: "39",
          features: ["Unlimited sites", "SEO reports", "24/7 support", "API access"],
          popular: false,
        },
      ],
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-mono font-bold text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground font-mono">
              {t.subtitle}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {t.plans.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "relative p-8 rounded-lg border bg-card transition-all duration-300 hover:border-primary/50",
                  plan.popular ? "border-primary" : "border-border"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono rounded-full">
                    {t.popular}
                  </span>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-mono font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-mono font-bold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground font-mono text-sm">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground font-mono">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth?mode=signup" className="block">
                  <Button
                    className={cn(
                      "w-full font-mono group",
                      plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    variant={plan.popular ? "default" : "secondary"}
                  >
                    {t.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Trial notice */}
          <p className="text-center text-muted-foreground font-mono text-sm">
            ✓ {t.trial} • ✓ Sans carte bancaire
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
