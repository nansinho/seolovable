import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ArrowDown, Loader2, Crown, Zap, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UpgradePreviewModal } from "@/components/UpgradePreviewModal";

const PLANS = {
  starter: {
    id: "starter",
    priceId: "price_1SgQV2KVQwNIgFQrudfBCa40",
    icon: Zap,
    sitesLimit: 1,
    order: 1,
  },
  pro: {
    id: "pro",
    priceId: "price_1SgQVRKVQwNIgFQrBW5LjlIh",
    icon: Crown,
    sitesLimit: 5,
    order: 2,
  },
  business: {
    id: "business",
    priceId: "price_1SgQVdKVQwNIgFQr8BjyVsph",
    icon: Building2,
    sitesLimit: 999,
    order: 3,
  }
};

const PLAN_COLORS = {
  starter: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    border: "border-blue-500/30",
    borderActive: "border-blue-500",
    text: "text-blue-400",
    shadow: "shadow-blue-500/20",
    badge: "bg-blue-500 text-white",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  pro: {
    bg: "bg-accent",
    bgLight: "bg-accent/10",
    border: "border-accent/30",
    borderActive: "border-accent",
    text: "text-accent",
    shadow: "shadow-accent/20",
    badge: "bg-accent text-accent-foreground",
    button: "bg-accent hover:bg-accent/90 text-accent-foreground",
  },
  business: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-500/10",
    border: "border-purple-500/30",
    borderActive: "border-purple-500",
    text: "text-purple-400",
    shadow: "shadow-purple-500/20",
    badge: "bg-purple-500 text-white",
    button: "bg-purple-500 hover:bg-purple-600 text-white",
  },
};

interface ProrationPreview {
  credit: number;
  debit: number;
  amountDue: number;
  renewalDate: string;
  currentPlan: string;
  newPlan: string;
  currency: string;
}

const Upgrade = () => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [prorationPreview, setProrationPreview] = useState<ProrationPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isConfirmingUpgrade, setIsConfirmingUpgrade] = useState(false);

  const content = {
    fr: {
      eyebrow: "Tarification",
      title: "Choisissez votre",
      titleAccent: "plan",
      subtitle: "Des formules adaptées à chaque étape de votre croissance. Passez à l'échelle sans limites.",
      currentPlan: "Plan actuel",
      upgrade: "Passer à ce plan",
      downgrade: "Rétrograder",
      manage: "Gérer",
      guarantee: "Garantie satisfait ou remboursé 14 jours",
      changePlanNote: "Changez de plan à tout moment. Les montants sont calculés au prorata.",
      upgradeSuccess: "Plan mis à jour !",
      upgradeSuccessDesc: "Votre abonnement a été mis à jour avec succès.",
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: "29",
          period: "/mois",
          desc: "Idéal pour démarrer",
          features: ["1 site web", "10 000 pages/mois", "Support par email", "Rapports basiques", "SSL inclus"],
        },
        {
          id: "pro",
          name: "Pro",
          price: "59",
          period: "/mois",
          desc: "Pour les équipes ambitieuses",
          features: ["5 sites web", "Pages illimitées", "Analytics avancés", "Support prioritaire", "Accès API", "Webhooks"],
        },
        {
          id: "business",
          name: "Business",
          price: "99",
          period: "/mois",
          desc: "Solution entreprise",
          features: ["Sites illimités", "Rapports SEO détaillés", "Support 24/7", "API complète", "Manager dédié", "SLA 99.9%"],
        },
      ],
    },
    en: {
      eyebrow: "Pricing",
      title: "Choose your",
      titleAccent: "plan",
      subtitle: "Plans tailored to every stage of your growth. Scale without limits.",
      currentPlan: "Current plan",
      upgrade: "Upgrade to this plan",
      downgrade: "Downgrade",
      manage: "Manage",
      guarantee: "14-day money-back guarantee",
      changePlanNote: "Change plans anytime. Amounts are prorated.",
      upgradeSuccess: "Plan updated!",
      upgradeSuccessDesc: "Your subscription has been updated successfully.",
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: "29",
          period: "/mo",
          desc: "Perfect to get started",
          features: ["1 website", "10,000 pages/month", "Email support", "Basic reports", "SSL included"],
        },
        {
          id: "pro",
          name: "Pro",
          price: "59",
          period: "/mo",
          desc: "For ambitious teams",
          features: ["5 websites", "Unlimited pages", "Advanced analytics", "Priority support", "API access", "Webhooks"],
        },
        {
          id: "business",
          name: "Business",
          price: "99",
          period: "/mo",
          desc: "Enterprise solution",
          features: ["Unlimited sites", "Detailed SEO reports", "24/7 support", "Full API", "Dedicated manager", "99.9% SLA"],
        },
      ],
    },
  };

  const t = content[lang];

  const getCurrentPlanOrder = () => PLANS[currentPlan as keyof typeof PLANS]?.order || 0;
  const getPlanOrder = (planId: string) => PLANS[planId as keyof typeof PLANS]?.order || 0;

  const isUpgrade = (planId: string) => getPlanOrder(planId) > getCurrentPlanOrder();
  const isDowngrade = (planId: string) => getPlanOrder(planId) < getCurrentPlanOrder();

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
    if (currentPlan === "free") {
      await handleCheckout(planId);
      return;
    }

    setSelectedPlanId(planId);
    setShowPreviewModal(true);
    setIsLoadingPreview(true);
    setProrationPreview(null);

    try {
      const { data, error } = await supabase.functions.invoke("upgrade-subscription", {
        body: { planId, preview: true }
      });

      if (error) throw error;

      if (data?.needsCheckout) {
        setShowPreviewModal(false);
        await handleCheckout(planId);
        return;
      }

      if (data?.preview) {
        setProrationPreview(data as ProrationPreview);
      }
    } catch (error) {
      console.error("Error getting proration preview:", error);
      setShowPreviewModal(false);
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: lang === "fr" ? "Impossible de calculer le prorata." : "Unable to calculate proration.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanId) return;

    setIsConfirmingUpgrade(true);

    try {
      const { data, error } = await supabase.functions.invoke("upgrade-subscription", {
        body: { planId: selectedPlanId, preview: false }
      });

      if (error) throw error;

      if (data?.success) {
        setCurrentPlan(selectedPlanId);
        setShowPreviewModal(false);
        toast({
          title: t.upgradeSuccess,
          description: t.upgradeSuccessDesc,
        });
      } else if (data?.needsCheckout) {
        setShowPreviewModal(false);
        await handleCheckout(selectedPlanId);
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: lang === "fr" ? "Impossible de mettre à jour l'abonnement." : "Unable to update subscription.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingUpgrade(false);
    }
  };

  const handleCheckout = async (planId: string) => {
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
                const isPlanUpgrade = isUpgrade(plan.id);
                const isPlanDowngrade = isDowngrade(plan.id);
                const isPopular = plan.id === "pro";

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative flex flex-col p-6 lg:p-8 rounded-2xl border transition-all duration-300",
                      isCurrentPlan
                        ? cn("bg-card border-2", planColors.borderActive, "shadow-lg", planColors.shadow)
                        : isPopular
                          ? "bg-card border-accent/50 shadow-lg shadow-accent/10 scale-105"
                          : "bg-card/50 backdrop-blur-sm border-border hover:border-accent/30"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Current plan badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={cn(
                          "text-xs font-mono font-semibold px-4 py-1.5 rounded-full shadow-lg",
                          planColors.badge
                        )}>
                          {t.currentPlan}
                        </span>
                      </div>
                    )}

                    {/* Popular badge (only if not current) */}
                    {isPopular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-accent text-accent-foreground text-xs font-mono font-semibold px-4 py-1.5 rounded-full shadow-lg">
                          Recommandé
                        </span>
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          planColors.bgLight
                        )}>
                          <Icon className={cn("w-5 h-5", planColors.text)} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.desc}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight text-foreground">{plan.price}</span>
                        <span className="text-xl text-muted-foreground">€</span>
                        <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            planColors.bgLight
                          )}>
                            <Check className={cn("w-3 h-3", planColors.text)} />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <Button 
                        className={cn("w-full h-12 font-semibold", planColors.button)}
                        onClick={handleManageSubscription}
                        disabled={loadingPlan === "manage"}
                      >
                        {loadingPlan === "manage" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t.manage
                        )}
                      </Button>
                    ) : isPlanUpgrade ? (
                      <Button 
                        className={cn("w-full h-12 font-semibold group", planColors.button)}
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
                    ) : isPlanDowngrade ? (
                      <Button 
                        variant="outline"
                        className="w-full h-12 font-semibold group"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loadingPlan === plan.id}
                      >
                        {loadingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {t.downgrade}
                            <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className={cn("w-full h-12 font-semibold group", planColors.button)}
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note about proration */}
            <p className="text-center text-sm text-muted-foreground mt-8">
              {t.changePlanNote}
            </p>
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
                <span className="text-sm">Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm">Support réactif</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Proration Preview Modal */}
      <UpgradePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handleConfirmUpgrade}
        preview={prorationPreview}
        isLoading={isLoadingPreview}
        isConfirming={isConfirmingUpgrade}
        lang={lang}
      />

      <Footer />
    </div>
  );
};

export default Upgrade;