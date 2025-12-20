import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";

const Pricing = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      eyebrow: "Tarification",
      title: "Simple et",
      titleAccent: "transparent",
      subtitle: "Choisissez votre plan. Annulez quand vous voulez.",
      popular: "Populaire",
      cta: "Commencer",
      trial: "14 jours gratuits",
      noCard: "Sans carte bancaire",
      plans: [
        {
          name: "Starter",
          price: "7",
          period: "/mois",
          desc: "Pour les projets personnels",
          features: ["1 site", "10k pages/mois", "Support email"],
          popular: false,
        },
        {
          name: "Pro",
          price: "15",
          period: "/mois",
          desc: "Pour les équipes en croissance",
          features: ["5 sites", "Pages illimitées", "Analytics avancés", "Support prioritaire"],
          popular: true,
        },
        {
          name: "Business",
          price: "39",
          period: "/mois",
          desc: "Pour les entreprises",
          features: ["Sites illimités", "Rapports SEO", "Support 24/7", "Accès API"],
          popular: false,
        },
      ],
    },
    en: {
      eyebrow: "Pricing",
      title: "Simple and",
      titleAccent: "transparent",
      subtitle: "Choose your plan. Cancel anytime.",
      popular: "Popular",
      cta: "Get started",
      trial: "14 days free",
      noCard: "No credit card required",
      plans: [
        {
          name: "Starter",
          price: "7",
          period: "/mo",
          desc: "For personal projects",
          features: ["1 site", "10k pages/month", "Email support"],
          popular: false,
        },
        {
          name: "Pro",
          price: "15",
          period: "/mo",
          desc: "For growing teams",
          features: ["5 sites", "Unlimited pages", "Advanced analytics", "Priority support"],
          popular: true,
        },
        {
          name: "Business",
          price: "39",
          period: "/mo",
          desc: "For enterprises",
          features: ["Unlimited sites", "SEO reports", "24/7 support", "API access"],
          popular: false,
        },
      ],
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background grain">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <section className="relative overflow-hidden pb-20">
            <Particles count={30} />
            <AnimatedSection>
              <div className="text-center relative z-10">
                <p className="text-sm text-accent tracking-widest mb-6 font-mono uppercase animate-fade-up">
                  {t.eyebrow}
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
                  <span className="text-foreground">{t.title}</span>{" "}
                  <span className="font-mono text-accent animate-pulse-subtle">{t.titleAccent}</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
                  {t.subtitle}
                </p>
                <div className="mt-8 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto animate-fade-up" style={{ animationDelay: "300ms" }} />
              </div>
            </AnimatedSection>
          </section>

          {/* Pricing Cards */}
          <section className="py-20 border-t border-border">
            <StaggeredList className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={120} animation="fade-up">
              {t.plans.map((plan, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative p-8 rounded-xl border transition-all duration-500",
                    plan.popular 
                      ? "bg-foreground text-background border-foreground animate-glow-pulse" 
                      : "bg-card border-border hover-lift border-glow"
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-6 bg-accent text-accent-foreground text-xs font-mono font-medium px-3 py-1 rounded-full">
                      {t.popular}
                    </span>
                  )}

                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2 font-mono">{plan.name}</h3>
                    <p className={cn(
                      "text-sm mb-6",
                      plan.popular ? "text-background/60" : "text-muted-foreground"
                    )}>
                      {plan.desc}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="number-display text-5xl font-mono font-medium">{plan.price}</span>
                      <span className={cn(
                        "text-2xl font-mono",
                        plan.popular ? "text-background/60" : "text-muted-foreground"
                      )}>€</span>
                      <span className={cn(
                        "text-sm ml-1 font-mono",
                        plan.popular ? "text-background/60" : "text-muted-foreground"
                      )}>{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0",
                          plan.popular ? "text-background/80" : "text-accent"
                        )} />
                        <span className={cn(
                          "text-sm",
                          plan.popular ? "text-background/80" : "text-muted-foreground"
                        )}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth?mode=signup" className="block">
                    <Button 
                      className="w-full group" 
                      variant={plan.popular ? "secondary" : "outline"}
                    >
                      {t.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ))}
            </StaggeredList>
          </section>

          {/* Trial notice */}
          <AnimatedSection delay={300}>
            <div className="text-center py-12 border-t border-border">
              <p className="text-muted-foreground font-mono text-sm flex items-center justify-center gap-4">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  {t.trial}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  {t.noCard}
                </span>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
