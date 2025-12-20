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
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 md:pt-40">
          {/* Modern matte background: subtle grid + animated glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 grid-subtle opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_25%_15%,hsl(var(--primary)/0.18),transparent_60%)] animate-breathe" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_80%_25%,hsl(var(--primary)/0.12),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background))_40%,transparent)]" />
          </div>

          <div className="container mx-auto px-4 pb-20 md:pb-28">
            <div className="grid items-start gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-7">
                <AnimatedSection>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono">
                      SEO • PRERENDER • AI CRAWLERS
                    </span>
                  </div>
                  <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-foreground font-display leading-[1.1]">
                    {t.hero.title}{" "}
                    <span className="text-primary text-glow">{t.hero.titleHighlight}</span>
                  </h1>
                </AnimatedSection>

                <AnimatedSection delay={120}>
                  <p className="mt-7 max-w-lg text-lg md:text-xl leading-relaxed text-muted-foreground">
                    {t.hero.subtitle}
                  </p>
                </AnimatedSection>

                <AnimatedSection delay={220}>
                  <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <Link to="/auth?mode=signup">
                      <Button size="lg" className="h-14 px-10 text-base font-semibold">
                        {t.hero.cta}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <div className="text-sm text-muted-foreground font-mono">
                      <span className="text-foreground font-medium">14 jours</span> • Sans carte
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={350}>
                  <div className="mt-16 grid max-w-lg grid-cols-3 gap-5">
                    {t.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="group rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur card-hover"
                      >
                        <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-display">
                          {stat.value}
                        </div>
                        <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              </div>

              <div className="md:col-span-5">
                <AnimatedSection animation="scale" delay={250}>
                  <div className="rounded-2xl border border-border/60 bg-card/50 p-7 backdrop-blur glass gradient-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs tracking-[0.25em] uppercase text-primary font-mono">Preview</p>
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
                        Googlebot
                      </span>
                    </div>

                    <div className="mt-6 rounded-xl border border-border/50 bg-background/40 p-5">
                      <pre className="text-[11px] leading-relaxed text-muted-foreground overflow-x-auto font-mono">
                        <code>{`<html>\n  <body>\n    <h1>${t.hero.title} ${t.hero.titleHighlight}</h1>\n    <p>${t.hero.subtitle}</p>\n  </body>\n</html>`}</code>
                      </pre>
                    </div>

                    <div className="mt-7 space-y-4">
                      {[
                        "HTML prêt à indexer pour Google, Bing et les crawlers IA.",
                        "Zéro refacto de votre app — vous gardez votre stack."
                      ].map((text, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Check className="h-3 w-3" />
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="border-t border-border/50" />
          </div>
        </section>

        {/* Problem */}
        <section className="relative border-t border-border/50 bg-background overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 grid-subtle opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_90%_20%,hsl(0_70%_50%/0.08),transparent_55%)]" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <AnimatedSection>
                  <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs text-destructive font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    {t.problem.label}
                  </span>
                  <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-[-0.03em] text-foreground font-display">
                    {t.problem.title}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                    {t.problem.desc}
                  </p>
                </AnimatedSection>
              </div>

              <div className="md:col-span-7">
                <AnimatedSection delay={150} animation="blur">
                  <div className="rounded-2xl border border-destructive/20 bg-card/40 p-7 backdrop-blur glass">
                    <p className="text-xs tracking-[0.25em] uppercase text-destructive/80 font-mono">Ce que Google voit</p>
                    <div className="mt-5 rounded-xl border border-border/50 bg-background/30 p-5">
                      <pre className="text-[11px] leading-relaxed text-muted-foreground overflow-x-auto font-mono">
                        <code>{`<html>\n  <body>\n    <div id=\"root\"></div>\n    <!-- aucun contenu -->\n  </body>\n</html>`}</code>
                      </pre>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="relative border-t border-border/50 bg-card overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_15%_35%,hsl(var(--primary)/0.12),transparent_55%)] animate-breathe" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <AnimatedSection>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t.solution.label}
                  </span>
                  <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-[-0.03em] text-foreground font-display">
                    {t.solution.title}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                    {t.solution.desc}
                  </p>
                </AnimatedSection>
              </div>

              <div className="md:col-span-7">
                <StaggeredList className="space-y-4" staggerDelay={100} animation="fade-up">
                  {t.solution.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-5 rounded-xl border border-border/50 bg-background/30 p-5 backdrop-blur glass card-hover"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-mono font-semibold">
                        {i + 1}
                      </div>
                      <span className="text-foreground font-medium">{step}</span>
                    </div>
                  ))}
                </StaggeredList>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative border-t border-border/50 bg-background overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 grid-subtle opacity-25" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32">
            <AnimatedSection>
              <div className="max-w-2xl mx-auto text-center mb-14">
                <p className="text-xs tracking-[0.3em] uppercase text-primary font-mono">
                  {t.features.label}
                </p>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.03em] text-foreground font-display">
                  {t.features.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
              staggerDelay={80}
              animation="fade-up"
            >
              {t.features.items.map((feature, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-border/50 bg-card/40 p-7 backdrop-blur glass card-hover"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                    <Star className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground font-display">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative border-t border-border/70 bg-card">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(760px_520px_at_75%_25%,hsl(var(--primary)/0.09),transparent_60%)]" />
          </div>

          <div className="container mx-auto px-4 py-20 md:py-28">
            <AnimatedSection>
              <div className="max-w-3xl">
                <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground font-mono">
                  {t.testimonials.label}
                </p>
                <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-foreground">
                  {t.testimonials.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="mt-10 grid gap-4 md:grid-cols-3" staggerDelay={90} animation="fade-up">
              {t.testimonials.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/70 bg-background/22 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/20"
                >
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-foreground">“{item.text}”</p>
                  <div className="mt-6">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-mono">
                      {item.role}
                    </p>
                  </div>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative border-t border-border/70 bg-background overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 grid-subtle opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_50%_20%,hsl(var(--primary)/0.12),transparent_60%)]" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32">
            <AnimatedSection>
              <div className="max-w-3xl mx-auto text-center mb-14">
                <p className="text-xs tracking-[0.3em] uppercase text-primary font-mono">
                  {t.pricing.label}
                </p>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.03em] text-foreground font-display">
                  {t.pricing.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="mt-10 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto" staggerDelay={120} animation="fade-up">
              {t.pricing.plans.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative rounded-2xl p-8 card-hover glass",
                    plan.popular 
                      ? "border-2 border-primary/50 gradient-border glow" 
                      : "border border-border/60"
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-lg">
                      {t.pricing.popular}
                    </span>
                  )}

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground font-display">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Pour lancer rapidement.</p>
                  </div>

                  <div className="mt-8 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold tracking-tight text-foreground font-display">
                      {plan.price}€
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">{plan.period}</span>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10">
                    <Link to="/auth?mode=signup">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                        {t.pricing.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative border-t border-border/70 bg-card overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_50%_50%,hsl(var(--primary)/0.15),transparent_60%)] animate-breathe" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-2xl mx-auto text-center">
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-foreground font-display text-glow">
                  {t.cta.title}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  {t.cta.desc}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="h-14 px-10 text-base font-semibold animate-pulse-glow">
                      {t.cta.button}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground font-mono">
                    14 jours gratuits • Sans CB
                  </span>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
