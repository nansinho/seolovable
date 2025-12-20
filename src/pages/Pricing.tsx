import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, Crown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";

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
          id: "starter",
          name: "Starter",
          price: "29",
          period: "/mois",
          desc: "Idéal pour démarrer",
          features: ["1 site web", "10 000 pages/mois", "Support par email", "Rapports basiques", "SSL inclus"],
          popular: false,
        },
        {
          id: "pro",
          name: "Pro",
          price: "59",
          period: "/mois",
          desc: "Pour les équipes ambitieuses",
          features: ["5 sites web", "Pages illimitées", "Analytics avancés", "Support prioritaire", "Accès API", "Webhooks"],
          popular: true,
        },
        {
          id: "business",
          name: "Business",
          price: "99",
          period: "/mois",
          desc: "Solution entreprise",
          features: ["Sites illimités", "Rapports SEO détaillés", "Support 24/7", "API complète", "Manager dédié", "SLA 99.9%"],
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
          id: "starter",
          name: "Starter",
          price: "29",
          period: "/mo",
          desc: "Perfect to get started",
          features: ["1 website", "10,000 pages/month", "Email support", "Basic reports", "SSL included"],
          popular: false,
        },
        {
          id: "pro",
          name: "Pro",
          price: "59",
          period: "/mo",
          desc: "For ambitious teams",
          features: ["5 websites", "Unlimited pages", "Advanced analytics", "Priority support", "API access", "Webhooks"],
          popular: true,
        },
        {
          id: "business",
          name: "Business",
          price: "99",
          period: "/mo",
          desc: "Enterprise solution",
          features: ["Unlimited sites", "Detailed SEO reports", "24/7 support", "Full API", "Dedicated manager", "99.9% SLA"],
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
          <section className="py-12">
            <StaggeredList className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto" staggerDelay={120} animation="fade-up">
              {t.plans.map((plan, index) => {
                const colors = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS];
                const Icon = colors?.icon || Zap;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "relative p-6 lg:p-8 rounded-2xl border transition-all duration-300",
                      plan.popular 
                        ? "bg-card border-accent shadow-lg shadow-accent/10 scale-105" 
                        : "bg-card/50 backdrop-blur-sm border-border hover:border-accent/30"
                    )}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-mono font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        {t.popular}
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
                      <p className="text-sm text-muted-foreground">{plan.desc}</p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight text-foreground">{plan.price}</span>
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
                        {t.cta}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
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