import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star, Crown, ArrowRight, HelpCircle } from "lucide-react";
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
      { text: "1 site Lovable", included: true },
      { text: "10 000 pages/mois", included: true },
      { text: "Prerender basique", included: true },
      { text: "Vérification auto", included: true },
      { text: "Support email", included: true },
      { text: "Dashboard stats", included: false },
      { text: "Cache intelligent", included: false },
      { text: "Intégration AI", included: false },
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
      { text: "5 sites Lovable", included: true },
      { text: "Pages illimitées", included: true },
      { text: "Prerender avancé", included: true },
      { text: "Vérification auto", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Dashboard stats bots", included: true },
      { text: "Cache intelligent", included: true },
      { text: "Intégration AI", included: false },
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
      { text: "Sites illimités", included: true },
      { text: "Pages illimitées", included: true },
      { text: "Prerender ultra-rapide", included: true },
      { text: "Vérification auto", included: true },
      { text: "Support 24/7", included: true },
      { text: "Dashboard stats bots", included: true },
      { text: "Cache intelligent", included: true },
      { text: "Intégration AI (Claude)", included: true },
    ],
    cta: "S'abonner maintenant",
    popular: false,
  },
];

const faqs = [
  {
    question: "Qu'est-ce que le prerendering ?",
    answer:
      "Le prerendering génère une version HTML statique de vos pages React/Vite. Les moteurs de recherche comme Google peuvent ainsi crawler et indexer tout votre contenu sans exécuter JavaScript.",
  },
  {
    question: "Est-ce que ça ralentit mon site ?",
    answer:
      "Non ! Le prerender est transparent pour vos utilisateurs. Seuls les bots (Google, Bing, AI) reçoivent la version pré-rendue. Vos visiteurs humains voient votre site React normal.",
  },
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "Vous avez 14 jours pour tester toutes les fonctionnalités. Aucune carte bancaire n'est requise. Si vous ne vous abonnez pas, votre compte est simplement désactivé.",
  },
  {
    question: "Puis-je changer de plan ?",
    answer:
      "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 relative matrix-bg">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/10 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-code text-primary">Promo lancement -20%</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-code text-primary mb-6">
                Tarifs simples et transparents
              </h1>
              <p className="text-lg text-muted-foreground font-code">
                Choisissez le plan qui correspond à vos besoins.
                Tous les plans incluent un essai gratuit de 14 jours.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative p-8 rounded-lg border bg-card card-hover",
                    plan.popular ? "border-primary glow-green" : "border-border"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-code font-bold">
                      POPULAIRE
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold font-code text-primary mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold font-code text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground font-code line-through">
                      {plan.originalPrice}
                    </span>
                    <span className="text-muted-foreground font-code">{plan.period}</span>
                  </div>

                  <p className="text-sm text-muted-foreground font-code mb-6">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            feature.included ? "text-primary" : "text-muted-foreground/30"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-code",
                            feature.included
                              ? "text-muted-foreground"
                              : "text-muted-foreground/30 line-through"
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth?mode=signup">
                    <Button
                      className={cn("w-full font-code", plan.popular && "glow-green")}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-code text-primary mb-4">
                Questions fréquentes
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6 rounded-lg border border-border bg-background">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold font-code text-primary mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground font-code">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;