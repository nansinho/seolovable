import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2, Crown, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PLANS = {
  starter: {
    id: "starter",
    priceId: "price_1SgQV2KVQwNIgFQrudfBCa40",
    icon: Zap,
    sitesLimit: 1,
  },
  pro: {
    id: "pro",
    priceId: "price_1SgQVRKVQwNIgFQrBW5LjlIh",
    icon: Crown,
    sitesLimit: 5,
  },
  business: {
    id: "business",
    priceId: "price_1SgQVdKVQwNIgFQr8BjyVsph",
    icon: Building2,
    sitesLimit: 999,
  }
};

const Upgrade = () => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);

  const content = {
    fr: {
      eyebrow: "Mise à niveau",
      title: "Passez au niveau",
      titleAccent: "supérieur",
      subtitle: "Débloquez plus de fonctionnalités pour développer votre présence en ligne.",
      currentPlan: "Plan actuel",
      upgrade: "Passer à ce plan",
      manage: "Gérer l'abonnement",
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: "29",
          period: "/mois",
          desc: "Pour les projets personnels",
          features: ["1 site", "10k pages/mois", "Support email", "Rapports basiques"],
          popular: false,
        },
        {
          id: "pro",
          name: "Pro",
          price: "59",
          period: "/mois",
          desc: "Pour les équipes en croissance",
          features: ["5 sites", "Pages illimitées", "Analytics avancés", "Support prioritaire", "API access"],
          popular: true,
        },
        {
          id: "business",
          name: "Business",
          price: "99",
          period: "/mois",
          desc: "Pour les entreprises",
          features: ["Sites illimités", "Rapports SEO", "Support 24/7", "Accès API complet", "Manager dédié"],
          popular: false,
        },
      ],
    },
    en: {
      eyebrow: "Upgrade",
      title: "Level up your",
      titleAccent: "presence",
      subtitle: "Unlock more features to grow your online presence.",
      currentPlan: "Current plan",
      upgrade: "Upgrade to this plan",
      manage: "Manage subscription",
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: "29",
          period: "/mo",
          desc: "For personal projects",
          features: ["1 site", "10k pages/month", "Email support", "Basic reports"],
          popular: false,
        },
        {
          id: "pro",
          name: "Pro",
          price: "59",
          period: "/mo",
          desc: "For growing teams",
          features: ["5 sites", "Unlimited pages", "Advanced analytics", "Priority support", "API access"],
          popular: true,
        },
        {
          id: "business",
          name: "Business",
          price: "99",
          period: "/mo",
          desc: "For enterprises",
          features: ["Unlimited sites", "SEO reports", "24/7 support", "Full API access", "Dedicated manager"],
          popular: false,
        },
      ],
    },
  };

  const t = content[lang];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login&redirect=/upgrade");
        return;
      }
      
      // Check current subscription
      try {
        const { data, error } = await supabase.functions.invoke("check-subscription");
        if (!error && data) {
          setCurrentPlan(data.planType || "free");
        }
      } catch (e) {
        console.error("Error checking subscription:", e);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Handle payment canceled
    if (searchParams.get("payment") === "canceled") {
      toast({
        title: lang === "fr" ? "Paiement annulé" : "Payment canceled",
        description: lang === "fr" ? "Vous pouvez réessayer quand vous le souhaitez." : "You can try again whenever you want.",
        variant: "destructive",
      });
    }
  }, [navigate, searchParams, toast, lang]);

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: lang === "fr" ? "Impossible de créer la session de paiement." : "Unable to create payment session.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan("manage");
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: lang === "fr" ? "Impossible d'ouvrir le portail de gestion." : "Unable to open management portal.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grain">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <section className="relative overflow-hidden pb-20">
            <Particles count={30} />
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
          </section>

          {/* Pricing Cards */}
          <section className="py-20 border-t border-border">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {t.plans.map((plan, index) => {
                const planConfig = PLANS[plan.id as keyof typeof PLANS];
                const Icon = planConfig?.icon || Zap;
                const isCurrentPlan = currentPlan === plan.id;
                const canUpgrade = !isCurrentPlan && currentPlan !== "business";

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative p-8 rounded-xl border transition-all duration-500",
                      plan.popular 
                        ? "bg-foreground text-background border-foreground animate-glow-pulse" 
                        : "bg-card border-border hover-lift border-glow",
                      isCurrentPlan && "ring-2 ring-accent"
                    )}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-6 bg-accent text-accent-foreground text-xs font-mono font-medium px-3 py-1 rounded-full">
                        Populaire
                      </span>
                    )}

                    {isCurrentPlan && (
                      <span className="absolute -top-3 right-6 bg-accent text-accent-foreground text-xs font-mono font-medium px-3 py-1 rounded-full">
                        {t.currentPlan}
                      </span>
                    )}

                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={cn(
                          "w-5 h-5",
                          plan.popular ? "text-background/80" : "text-accent"
                        )} />
                        <h3 className="text-lg font-medium font-mono">{plan.name}</h3>
                      </div>
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

                    {isCurrentPlan ? (
                      <Button 
                        className="w-full group" 
                        variant={plan.popular ? "secondary" : "outline"}
                        onClick={handleManageSubscription}
                        disabled={loadingPlan === "manage"}
                      >
                        {loadingPlan === "manage" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {t.manage}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    ) : canUpgrade ? (
                      <Button 
                        className="w-full group" 
                        variant={plan.popular ? "secondary" : "outline"}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loadingPlan === plan.id}
                      >
                        {loadingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {t.upgrade}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled
                      >
                        {t.currentPlan}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upgrade;
