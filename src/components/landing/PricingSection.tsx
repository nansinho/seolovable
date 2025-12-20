import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "7€",
    period: "/mo",
    description: "Perfect for testing",
    features: [
      "1 Lovable site",
      "10,000 pages/month",
      "Basic prerender",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "15€",
    period: "/mo",
    description: "+200% traffic guaranteed",
    features: [
      "5 Lovable sites",
      "Unlimited pages",
      "Bot stats dashboard",
      "Smart cache",
      "Priority support",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "39€",
    period: "/mo",
    description: "For Lovable pros",
    features: [
      "Unlimited sites",
      "Monthly SEO reports",
      "24/7 support",
      "AI integration",
      "Custom features",
      "99.9% SLA",
    ],
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4 opacity-0 animate-fade-in"
          >
            Simple pricing
          </h2>
          <p 
            className="text-muted-foreground font-mono max-w-xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Launch promo - Limited time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative p-6 rounded-lg bg-card border transition-all duration-300 opacity-0 animate-fade-in-up",
                plan.popular
                  ? "border-primary glow scale-105 z-10"
                  : "border-border card-hover"
              )}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-mono">
                  Popular
                </div>
              )}

              <h3 className="text-xl font-mono font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-mono font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {plan.period}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground font-mono mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground font-mono">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/auth?mode=signup" className="block">
                <Button
                  className={cn(
                    "w-full font-mono group",
                    !plan.popular && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  variant={plan.popular ? "default" : "secondary"}
                >
                  Get started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div 
          className="flex flex-wrap justify-center items-center gap-8 mt-12 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono">Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono">30-day refund</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono">14-day free trial</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
