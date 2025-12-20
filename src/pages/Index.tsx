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

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 md:pt-36">
          {/* Matte background treatment */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-220px] left-[-180px] h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 pb-16 md:pb-24">
            <div className="grid items-start gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <AnimatedSection>
                  <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
                    SEO • Prerender • Crawlers IA
                  </p>
                  <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
                    {t.hero.title}{" "}
                    <span className="text-primary">{t.hero.titleHighlight}</span>
                  </h1>
                </AnimatedSection>

                <AnimatedSection delay={120}>
                  <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
                    {t.hero.subtitle}
                  </p>
                </AnimatedSection>

                <AnimatedSection delay={220}>
                  <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <Link to="/auth?mode=signup">
                      <Button size="lg" className="h-12 px-8 text-base font-medium">
                        {t.hero.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-foreground font-medium">14 jours</span> • Sans carte • Annulation instantanée
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={320}>
                  <div className="mt-14 grid max-w-xl grid-cols-3 gap-6">
                    {t.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur"
                      >
                        <div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              </div>

              <div className="md:col-span-5">
                <AnimatedSection animation="scale" delay={200}>
                  <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                    <div className="flex items-center justify-between">
                      <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">Preview</p>
                      <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                        Googlebot
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
                      <pre className="text-[12px] leading-relaxed text-muted-foreground overflow-x-auto">
                        <code>{`<html>\n  <body>\n    <h1>${t.hero.title} ${t.hero.titleHighlight}</h1>\n    <p>${t.hero.subtitle}</p>\n  </body>\n</html>`}</code>
                      </pre>
                    </div>

                    <div className="mt-6 grid gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md border border-border bg-background/50 p-1.5 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          HTML prêt à indexer pour Google, Bing et les crawlers IA.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md border border-border bg-background/50 p-1.5 text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Zéro refacto de votre app — vous gardez votre stack.
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="border-t border-border" />
          </div>
        </section>

        {/* Problem */}
        <section className="bg-background">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="grid gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5">
                <AnimatedSection>
                  <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
                    {t.problem.label}
                  </p>
                  <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                    {t.problem.title}
                  </h2>
                  <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground">
                    {t.problem.desc}
                  </p>
                </AnimatedSection>
              </div>

              <div className="md:col-span-7">
                <AnimatedSection delay={120} animation="blur">
                  <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                    <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">Ce que Google voit</p>
                    <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                      <pre className="text-[12px] leading-relaxed text-muted-foreground overflow-x-auto">
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
        <section className="border-t border-border bg-card">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="grid gap-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5">
                <AnimatedSection>
                  <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
                    {t.solution.label}
                  </p>
                  <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                    {t.solution.title}
                  </h2>
                  <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground">
                    {t.solution.desc}
                  </p>
                </AnimatedSection>
              </div>

              <div className="md:col-span-7">
                <StaggeredList className="space-y-3" staggerDelay={90} animation="fade-up">
                  {t.solution.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl border border-border bg-background/40 p-4 backdrop-blur"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/70 text-primary">
                        <span className="text-sm font-medium">{i + 1}</span>
                      </div>
                      <span className="text-foreground">{step}</span>
                    </div>
                  ))}
                </StaggeredList>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-background">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <AnimatedSection>
              <div className="max-w-3xl">
                <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
                  {t.features.label}
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  {t.features.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList
              className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              staggerDelay={70}
              animation="fade-up"
            >
              {t.features.items.map((feature, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-border bg-card/40 p-6 backdrop-blur transition-colors hover:bg-card/60"
                >
                  <h3 className="text-base font-medium tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                  <div className="mt-5 h-px w-10 bg-border transition-all group-hover:w-14" />
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border bg-card">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <AnimatedSection>
              <div className="max-w-3xl">
                <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
                  {t.testimonials.label}
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  {t.testimonials.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="mt-10 grid gap-4 md:grid-cols-3" staggerDelay={90} animation="fade-up">
              {t.testimonials.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-background/40 p-6 backdrop-blur"
                >
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-foreground">“{item.text}”</p>
                  <div className="mt-6">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {item.role}
                    </p>
                  </div>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border bg-background">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <AnimatedSection>
              <div className="max-w-3xl">
                <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground">
                  {t.pricing.label}
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  {t.pricing.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="mt-10 grid gap-4 md:grid-cols-3" staggerDelay={90} animation="fade-up">
              {t.pricing.plans.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative rounded-2xl border bg-card/40 p-7 backdrop-blur",
                    plan.popular ? "border-primary/40" : "border-border"
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-6 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-foreground">
                      {t.pricing.popular}
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-medium text-foreground">{plan.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">Pour lancer rapidement.</p>
                    </div>
                    <div className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      {plan.period.replace("/", "")}
                    </div>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {plan.price}€
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link to="/auth?mode=signup">
                      <Button className="w-full" variant={plan.popular ? "default" : "secondary"}>
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
        <section className="border-t border-border bg-card">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-3xl">
              <AnimatedSection>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  {t.cta.title}
                </h2>
                <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground">
                  {t.cta.desc}
                </p>
                <div className="mt-8">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="h-12 px-8 text-base font-medium">
                      {t.cta.button}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
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
