import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";

const Index = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      hero: {
        title: "Rendez vos apps Lovable",
        titleHighlight: "visibles sur Google",
        subtitle: "Service de prerendering qui rend vos sites React indexables par les moteurs de recherche et les crawlers IA.",
        cta: "Commencer gratuitement",
      },
      stats: [
        { value: "12ms", label: "Temps de réponse" },
        { value: "100%", label: "Indexable" },
        { value: "5min", label: "Configuration" },
      ],
      problem: {
        label: "Le problème",
        title: "Vos apps React sont invisibles",
        desc: "Les moteurs de recherche ne peuvent pas lire le contenu généré par JavaScript. Votre site apparaît vide pour Google.",
      },
      solution: {
        label: "La solution",
        title: "Prerendering automatique",
        desc: "Nous générons une version HTML statique de vos pages, lisible par tous les crawlers.",
        steps: [
          "Inscription en 30 secondes",
          "Configuration DNS simple",
          "Vérification automatique",
          "Votre site est indexable",
        ],
      },
      features: {
        label: "Fonctionnalités",
        title: "Tout ce qu'il vous faut",
        items: [
          { title: "Ultra-rapide", desc: "HTML généré en moins de 50ms" },
          { title: "Multi-sites", desc: "Gérez tous vos projets" },
          { title: "Analytics", desc: "Suivez les crawls en temps réel" },
          { title: "SSL inclus", desc: "Certificats gratuits" },
          { title: "Edge global", desc: "Serveurs distribués" },
          { title: "AI-ready", desc: "Compatible ChatGPT, Claude" },
        ],
      },
      testimonials: {
        label: "Témoignages",
        title: "Ils utilisent SEO Lovable",
        items: [
          { name: "Marc D.", role: "Fondateur", text: "Mon trafic a triplé en 2 mois." },
          { name: "Sophie L.", role: "Product Manager", text: "Solution simple et efficace." },
          { name: "Thomas R.", role: "Développeur", text: "La meilleure solution du marché." },
        ],
      },
      pricing: {
        label: "Tarifs",
        title: "Tarification simple",
        plans: [
          { name: "Starter", price: "7", period: "/mois", features: ["1 site", "10k pages/mois", "Support email"], popular: false },
          { name: "Pro", price: "15", period: "/mois", features: ["5 sites", "Pages illimitées", "Analytics", "Support prioritaire"], popular: true },
          { name: "Business", price: "39", period: "/mois", features: ["Sites illimités", "Rapports SEO", "Support 24/7", "API"], popular: false },
        ],
        cta: "Choisir",
        popular: "Recommandé",
      },
      cta: {
        title: "Prêt à commencer ?",
        desc: "14 jours d'essai gratuit. Sans carte bancaire.",
        button: "Démarrer maintenant",
      },
    },
    en: {
      hero: {
        title: "Make your Lovable apps",
        titleHighlight: "visible on Google",
        subtitle: "Prerendering service that makes your React sites indexable by search engines and AI crawlers.",
        cta: "Start for free",
      },
      stats: [
        { value: "12ms", label: "Response time" },
        { value: "100%", label: "Indexable" },
        { value: "5min", label: "Setup" },
      ],
      problem: {
        label: "The problem",
        title: "Your React apps are invisible",
        desc: "Search engines can't read JavaScript-generated content. Your site appears empty to Google.",
      },
      solution: {
        label: "The solution",
        title: "Automatic prerendering",
        desc: "We generate a static HTML version of your pages, readable by all crawlers.",
        steps: [
          "Sign up in 30 seconds",
          "Simple DNS configuration",
          "Automatic verification",
          "Your site is indexable",
        ],
      },
      features: {
        label: "Features",
        title: "Everything you need",
        items: [
          { title: "Ultra-fast", desc: "HTML generated in under 50ms" },
          { title: "Multi-site", desc: "Manage all your projects" },
          { title: "Analytics", desc: "Track crawls in real-time" },
          { title: "SSL included", desc: "Free certificates" },
          { title: "Global edge", desc: "Distributed servers" },
          { title: "AI-ready", desc: "Compatible with ChatGPT, Claude" },
        ],
      },
      testimonials: {
        label: "Testimonials",
        title: "They use SEO Lovable",
        items: [
          { name: "Marc D.", role: "Founder", text: "My traffic tripled in 2 months." },
          { name: "Sophie L.", role: "Product Manager", text: "Simple and effective solution." },
          { name: "Thomas R.", role: "Developer", text: "Best solution on the market." },
        ],
      },
      pricing: {
        label: "Pricing",
        title: "Simple pricing",
        plans: [
          { name: "Starter", price: "7", period: "/mo", features: ["1 site", "10k pages/month", "Email support"], popular: false },
          { name: "Pro", price: "15", period: "/mo", features: ["5 sites", "Unlimited pages", "Analytics", "Priority support"], popular: true },
          { name: "Business", price: "39", period: "/mo", features: ["Unlimited sites", "SEO reports", "24/7 support", "API"], popular: false },
        ],
        cta: "Choose",
        popular: "Recommended",
      },
      cta: {
        title: "Ready to start?",
        desc: "14-day free trial. No credit card required.",
        button: "Get started now",
      },
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background noise">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight tracking-tight mb-6">
                {t.hero.title}
                <br />
                <span className="text-primary">{t.hero.titleHighlight}</span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                {t.hero.subtitle}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="h-12 px-8 text-base font-medium">
                  {t.hero.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </AnimatedSection>
          </div>

          {/* Stats */}
          <AnimatedSection delay={300}>
            <div className="flex justify-center gap-16 md:gap-24 mt-20">
              {t.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <p className="text-sm text-primary font-medium mb-4">{t.problem.label}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">{t.problem.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{t.problem.desc}</p>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="mt-12 p-6 rounded-lg bg-card border border-border">
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{`<!-- Ce que Google voit -->
<html>
  <body>
    <div id="root"></div>
    <!-- Aucun contenu -->
  </body>
</html>`}</code>
                </pre>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 md:py-32 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <p className="text-sm text-primary font-medium mb-4">{t.solution.label}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">{t.solution.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-12">{t.solution.desc}</p>
            </AnimatedSection>

            <StaggeredList className="space-y-4" staggerDelay={100}>
              {t.solution.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">{i + 1}</span>
                  </div>
                  <span className="text-foreground">{step}</span>
                </div>
              ))}
            </StaggeredList>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-sm text-primary font-medium mb-4">{t.features.label}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">{t.features.title}</h2>
            </div>
          </AnimatedSection>

          <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={80}>
            {t.features.items.map((feature, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                <h3 className="text-lg font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-sm text-primary font-medium mb-4">{t.testimonials.label}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">{t.testimonials.title}</h2>
            </div>
          </AnimatedSection>

          <StaggeredList className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={100}>
            {t.testimonials.items.map((item, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-background">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6">"{item.text}"</p>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-sm text-primary font-medium mb-4">{t.pricing.label}</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">{t.pricing.title}</h2>
            </div>
          </AnimatedSection>

          <StaggeredList className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerDelay={100}>
            {t.pricing.plans.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "relative p-8 rounded-lg border bg-card",
                  plan.popular ? "border-primary" : "border-border"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {t.pricing.popular}
                  </span>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-lg font-medium text-foreground mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-semibold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button className="w-full" variant={plan.popular ? "default" : "secondary"}>
                    {t.pricing.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{t.cta.title}</h2>
            <p className="text-muted-foreground mb-8">{t.cta.desc}</p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                {t.cta.button}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
