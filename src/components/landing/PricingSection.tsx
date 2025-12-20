import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    icon: Zap,
    price: "7€",
    originalPrice: "9€",
    period: "/mois",
    description: "Idéal pour tester le power SEO",
    gradient: "from-blue-500 to-cyan-500",
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
    gradient: "from-primary to-orange",
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
    gradient: "from-violet-500 to-purple-500",
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
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-card" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 opacity-0 animate-fade-in"
          >
            Choisissez votre <span className="gradient-text">hack SEO</span>
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Offres irrésistibles – Promo lancement limitée 🚀
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative p-8 rounded-2xl bg-card border transition-all duration-300 card-hover opacity-0 animate-fade-in-up",
                plan.popular
                  ? "border-primary glow-orange scale-105 z-10"
                  : "border-border hover:border-primary/30"
              )}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r from-primary to-orange text-primary-foreground text-xs font-display font-bold shadow-lg">
                  ⭐ POPULAIRE
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              {/* Plan name */}
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground line-through text-lg">
                  {plan.originalPrice}
                </span>
                <span className="text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-8">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/auth?mode=signup" className="block">
                <Button
                  className={cn(
                    "w-full font-display group",
                    plan.popular ? "glow-orange" : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div 
          className="flex flex-wrap justify-center items-center gap-8 mt-16 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm">Annulation à tout moment</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm">Satisfait ou remboursé 30j</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm">Support réactif</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
