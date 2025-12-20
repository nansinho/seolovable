import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    icon: Zap,
    price: "7€",
    originalPrice: "9€",
    period: "/mois",
    description: "Idéal pour tester le power SEO",
    features: [
      "1 site Lovable",
      "10 000 pages/mois",
      "Prerender basique",
      "Vérification auto",
      "Support email",
    ],
    cta: "Essai gratuit 14 jours",
    popular: false,
  },
  {
    name: "Pro",
    icon: Star,
    price: "15€",
    originalPrice: "19€",
    period: "/mois",
    description: "+200% trafic garanti ou remboursé",
    features: [
      "5 sites Lovable",
      "Pages illimitées",
      "Dashboard stats bots",
      "Cache intelligent",
      "Support prioritaire",
      "API access",
    ],
    cta: "S'abonner maintenant",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "39€",
    originalPrice: "49€",
    period: "/mois",
    description: "Pour les pros Lovable",
    features: [
      "Sites illimités",
      "Rapports SEO mensuels",
      "Support 24/7",
      "Intégration AI (Claude)",
      "Custom features",
      "SLA 99.9%",
    ],
    cta: "S'abonner maintenant",
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-24 relative matrix-bg">
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-code text-primary mb-6">
            Choisissez votre hack SEO
          </h2>
          <p className="text-lg text-muted-foreground font-code max-w-2xl mx-auto">
            Offres irrésistibles – Promo lancement limitée
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative p-8 rounded-lg border bg-card card-hover",
                plan.popular
                  ? "border-primary glow-green"
                  : "border-border"
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-code font-bold">
                  POPULAIRE
                </div>
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
                <plan.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Plan name */}
              <h3 className="text-xl font-bold font-code text-primary mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold font-code text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground font-code line-through">
                  {plan.originalPrice}
                </span>
                <span className="text-muted-foreground font-code">
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground font-code mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-code text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/auth?mode=signup">
                <Button
                  className={cn(
                    "w-full font-code",
                    plan.popular && "glow-green"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;