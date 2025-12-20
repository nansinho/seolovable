import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2, Crown, Zap, Building2, Sparkles } from "lucide-react";
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
    color: "blue",
  },
  pro: {
    id: "pro",
    priceId: "price_1SgQVRKVQwNIgFQrBW5LjlIh",
    icon: Crown,
    sitesLimit: 5,
    color: "accent",
  },
  business: {
    id: "business",
    priceId: "price_1SgQVdKVQwNIgFQr8BjyVsph",
    icon: Building2,
    sitesLimit: 999,
    color: "purple",
  }
};

// Color configurations for each plan
const PLAN_COLORS = {
  starter: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    border: "border-blue-500/30",
    borderActive: "border-blue-500",
    text: "text-blue-400",
    shadow: "shadow-blue-500/20",
    badge: "bg-blue-500 text-white",
    gradient: "from-blue-500 to-cyan-400",
  },
  pro: {
    bg: "bg-accent",
    bgLight: "bg-accent/10",
    border: "border-accent/30",
    borderActive: "border-accent",
    text: "text-accent",
    shadow: "shadow-accent/20",
    badge: "bg-accent text-accent-foreground",
    gradient: "from-accent to-yellow-400",
  },
  business: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-500/10",
    border: "border-purple-500/30",
    borderActive: "border-purple-500",
    text: "text-purple-400",
    shadow: "shadow-purple-500/20",
    badge: "bg-purple-500 text-white",
    gradient: "from-purple-500 to-pink-400",
  },
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
      eyebrow: "Tarification",
      title: "Choisissez votre",
      titleAccent: "plan",
      subtitle: "Des formules adaptées à chaque étape de votre croissance. Passez à l'échelle sans limites.",
      currentPlan: "Votre plan",
      upgrade: "Choisir ce plan",
      manage: "Gérer",
      guarantee: "Garantie satisfait ou remboursé 14 jours",
      changePlanNote: "Votre abonnement actuel sera annulé et remplacé par le nouveau plan.",
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
      title: "Choose your",
      titleAccent: "plan",
      subtitle: "Plans tailored to every stage of your growth. Scale without limits.",
      currentPlan: "Your plan",
      upgrade: "Choose this plan",
      manage: "Manage",
      guarantee: "14-day money-back guarantee",
      changePlanNote: "Your current subscription will be canceled and replaced with the new plan.",
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login&redirect=/upgrade");
        return;
      }
      
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground font-mono text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <main className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-accent">{t.eyebrow}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
              <span className="text-foreground">{t.title}</span>{" "}
              <span className="text-accent">{t.titleAccent}</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t.subtitle}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              <span>{t.guarantee}</span>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {t.plans.map((plan, index) => {
                const planConfig = PLANS[plan.id as keyof typeof PLANS];
                const planColors = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS];
                const Icon = planConfig?.icon || Zap;
                const isCurrentPlan = currentPlan === plan.id;
                const canUpgrade = !isCurrentPlan && currentPlan !== "business";
                const canChangePlan = !isCurrentPlan && currentPlan !== "free" && currentPlan !== "business";

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative flex flex-col p-6 lg:p-8 rounded-2xl border transition-all duration-300",
                      plan.popular 
                        ? "bg-accent text-accent-foreground border-accent scale-105 shadow-2xl shadow-accent/20" 
                        : isCurrentPlan
                          ? cn("bg-card/50 backdrop-blur-sm", planColors.borderActive, "border-2 shadow-lg", planColors.shadow)
                          : "bg-card/50 backdrop-blur-sm border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Popular badge */}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-background text-accent text-xs font-mono font-semibold px-4 py-1.5 rounded-full border border-accent/20 shadow-lg">
                          Recommandé
                        </span>
                      </div>
                    )}

                    {/* Current plan badge - with unique colors per plan */}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className={cn(
                          "text-xs font-mono font-semibold px-4 py-1.5 rounded-full shadow-lg",
                          plan.popular 
                            ? "bg-background text-accent" 
                            : planColors.badge
                        )}>
                          {t.currentPlan}
                        </span>
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          plan.popular ? "bg-accent-foreground/10" : planColors.bgLight
                        )}>
                          <Icon className={cn(
                            "w-5 h-5",
                            plan.popular ? "text-accent-foreground" : planColors.text
                          )} />
                        </div>
                        <h3 className="text-xl font-semibold">{plan.name}</h3>
                      </div>
                      <p className={cn(
                        "text-sm",
                        plan.popular ? "text-accent-foreground/70" : "text-muted-foreground"
                      )}>
                        {plan.desc}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                        <span className={cn(
                          "text-xl",
                          plan.popular ? "text-accent-foreground/70" : "text-muted-foreground"
                        )}>€</span>
                        <span className={cn(
                          "text-sm ml-1",
                          plan.popular ? "text-accent-foreground/60" : "text-muted-foreground"
                        )}>{plan.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            plan.popular ? "bg-accent-foreground/10" : planColors.bgLight
                          )}>
                            <Check className={cn(
                              "w-3 h-3",
                              plan.popular ? "text-accent-foreground" : planColors.text
                            )} />
                          </div>
                          <span className={cn(
                            "text-sm",
                            plan.popular ? "text-accent-foreground/80" : "text-muted-foreground"
                          )}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <Button 
                        className={cn(
                          "w-full h-12 font-semibold group",
                          plan.popular 
                            ? "bg-accent-foreground text-accent hover:bg-accent-foreground/90" 
                            : cn(planColors.bg, "text-white hover:opacity-90")
                        )}
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
                        className={cn(
                          "w-full h-12 font-semibold group",
                          plan.popular 
                            ? "bg-accent-foreground text-accent hover:bg-accent-foreground/90" 
                            : cn(planColors.bg, "text-white hover:opacity-90")
                        )}
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
                        className="w-full h-12 font-semibold" 
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

            {/* Note about plan change */}
            {currentPlan !== "free" && currentPlan !== "business" && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t.changePlanNote}
              </p>
            )}
          </section>

          {/* Trust indicators */}
          <section className="mt-20 text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm">Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm">Annulation à tout moment</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm">Support dédié</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upgrade;