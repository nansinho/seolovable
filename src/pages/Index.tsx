import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap, Globe, BarChart3, Shield, Server, Bot } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";

const Index = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      hero: {
        badge: "NOUVELLE GÉNÉRATION SEO",
        title: "Rendez vos apps",
        titleHighlight: "visibles sur Google",
        subtitle: "Service de prerendering qui rend vos sites React indexables par les moteurs de recherche et les crawlers IA.",
        cta: "DÉMARRER",
        secondary: "Voir la démo",
      },
      stats: [
        { value: "12", unit: "ms", label: "Latence" },
        { value: "100", unit: "%", label: "Indexable" },
        { value: "5", unit: "min", label: "Setup" },
      ],
      problem: {
        label: "Le problème",
        title: "Vos apps React sont invisibles",
        desc: "Les moteurs de recherche ne peuvent pas lire le contenu généré par JavaScript. Votre site apparaît vide pour Google.",
        code: `<html>\n  <body>\n    <div id="root"></div>\n    <!-- VIDE -->\n  </body>\n</html>`,
      },
      solution: {
        label: "La solution",
        title: "Prerendering automatique",
        desc: "Nous générons une version HTML statique de vos pages, lisible par tous les crawlers.",
        steps: [
          { num: "01", text: "Inscription en 30 secondes" },
          { num: "02", text: "Configuration DNS simple" },
          { num: "03", text: "Vérification automatique" },
          { num: "04", text: "Votre site est indexable" },
        ],
      },
      features: {
        label: "Fonctionnalités",
        title: "Technologie de pointe",
        items: [
          { icon: Zap, title: "Ultra-rapide", desc: "HTML généré en moins de 50ms" },
          { icon: Globe, title: "Multi-sites", desc: "Gérez tous vos projets" },
          { icon: BarChart3, title: "Analytics", desc: "Suivez les crawls en temps réel" },
          { icon: Shield, title: "SSL inclus", desc: "Certificats gratuits" },
          { icon: Server, title: "Edge global", desc: "Serveurs distribués" },
          { icon: Bot, title: "AI-ready", desc: "Compatible ChatGPT, Claude" },
        ],
      },
      testimonials: {
        label: "Témoignages",
        title: "Ils nous font confiance",
        items: [
          { name: "Marc D.", role: "Fondateur", text: "Mon trafic a triplé en 2 mois.", avatar: "M" },
          { name: "Sophie L.", role: "Product Manager", text: "Solution simple et efficace.", avatar: "S" },
          { name: "Thomas R.", role: "Développeur", text: "La meilleure solution du marché.", avatar: "T" },
        ],
      },
      pricing: {
        label: "Tarifs",
        title: "Choisissez votre plan",
        plans: [
          { name: "Starter", price: "7", period: "/mois", features: ["1 site", "10k pages/mois", "Support email"], popular: false },
          { name: "Pro", price: "15", period: "/mois", features: ["5 sites", "Pages illimitées", "Analytics", "Support prioritaire"], popular: true },
          { name: "Business", price: "39", period: "/mois", features: ["Sites illimités", "Rapports SEO", "Support 24/7", "API"], popular: false },
        ],
        cta: "CHOISIR",
        popular: "POPULAIRE",
      },
      cta: {
        title: "Prêt à dominer les SERPs ?",
        desc: "14 jours d'essai gratuit. Sans carte bancaire.",
        button: "COMMENCER MAINTENANT",
      },
    },
    en: {
      hero: {
        badge: "NEXT-GEN SEO",
        title: "Make your apps",
        titleHighlight: "visible on Google",
        subtitle: "Prerendering service that makes your React sites indexable by search engines and AI crawlers.",
        cta: "GET STARTED",
        secondary: "Watch demo",
      },
      stats: [
        { value: "12", unit: "ms", label: "Latency" },
        { value: "100", unit: "%", label: "Indexable" },
        { value: "5", unit: "min", label: "Setup" },
      ],
      problem: {
        label: "The problem",
        title: "Your React apps are invisible",
        desc: "Search engines can't read JavaScript-generated content. Your site appears empty to Google.",
        code: `<html>\n  <body>\n    <div id="root"></div>\n    <!-- EMPTY -->\n  </body>\n</html>`,
      },
      solution: {
        label: "The solution",
        title: "Automatic prerendering",
        desc: "We generate a static HTML version of your pages, readable by all crawlers.",
        steps: [
          { num: "01", text: "Sign up in 30 seconds" },
          { num: "02", text: "Simple DNS configuration" },
          { num: "03", text: "Automatic verification" },
          { num: "04", text: "Your site is indexable" },
        ],
      },
      features: {
        label: "Features",
        title: "Cutting-edge technology",
        items: [
          { icon: Zap, title: "Ultra-fast", desc: "HTML generated in under 50ms" },
          { icon: Globe, title: "Multi-site", desc: "Manage all your projects" },
          { icon: BarChart3, title: "Analytics", desc: "Track crawls in real-time" },
          { icon: Shield, title: "SSL included", desc: "Free certificates" },
          { icon: Server, title: "Global edge", desc: "Distributed servers" },
          { icon: Bot, title: "AI-ready", desc: "Compatible with ChatGPT, Claude" },
        ],
      },
      testimonials: {
        label: "Testimonials",
        title: "Trusted by developers",
        items: [
          { name: "Marc D.", role: "Founder", text: "My traffic tripled in 2 months.", avatar: "M" },
          { name: "Sophie L.", role: "Product Manager", text: "Simple and effective solution.", avatar: "S" },
          { name: "Thomas R.", role: "Developer", text: "Best solution on the market.", avatar: "T" },
        ],
      },
      pricing: {
        label: "Pricing",
        title: "Choose your plan",
        plans: [
          { name: "Starter", price: "7", period: "/mo", features: ["1 site", "10k pages/month", "Email support"], popular: false },
          { name: "Pro", price: "15", period: "/mo", features: ["5 sites", "Unlimited pages", "Analytics", "Priority support"], popular: true },
          { name: "Business", price: "39", period: "/mo", features: ["Unlimited sites", "SEO reports", "24/7 support", "API"], popular: false },
        ],
        cta: "CHOOSE",
        popular: "POPULAR",
      },
      cta: {
        title: "Ready to dominate the SERPs?",
        desc: "14-day free trial. No credit card required.",
        button: "START NOW",
      },
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20">
          {/* Animated background */}
          <div className="absolute inset-0 gradient-bg" />
          <div className="absolute inset-0 cyber-grid" />
          
          {/* Floating orbs */}
          <div className="orb orb-cyan w-[500px] h-[500px] -top-20 -left-40 animate-float" />
          <div className="orb orb-purple w-[400px] h-[400px] top-1/2 -right-32 animate-float-delayed" />
          <div className="orb orb-pink w-[300px] h-[300px] bottom-20 left-1/4 animate-float" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <AnimatedSection>
                {/* Badge */}
                <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 backdrop-blur px-5 py-2 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs tracking-[0.3em] text-primary font-mono font-medium">
                    {t.hero.badge}
                  </span>
                </div>

                {/* Main title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] font-display leading-[0.9]">
                  <span className="text-foreground">{t.hero.title}</span>
                  <br />
                  <span className="gradient-text-animated">{t.hero.titleHighlight}</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t.hero.subtitle}
                </p>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="min-w-[200px]">
                      {t.hero.cta}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="min-w-[200px]">
                    {t.hero.secondary}
                  </Button>
                </div>
              </AnimatedSection>

              {/* Stats */}
              <AnimatedSection delay={450}>
                <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                  {t.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground">
                        {stat.value}
                        <span className="text-primary neon-text">{stat.unit}</span>
                      </div>
                      <div className="mt-2 text-xs tracking-[0.25em] uppercase text-muted-foreground font-mono">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Problem Section */}
        <section className="relative py-32 tech-line">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,hsl(0_70%_50%/0.1),transparent)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div>
                <AnimatedSection>
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs tracking-[0.2em] text-red-400 font-mono uppercase mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    {t.problem.label}
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] font-display text-foreground">
                    {t.problem.title}
                  </h2>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    {t.problem.desc}
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={200} animation="scale">
                <div className="relative">
                  <div className="code-block relative p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-red-500/10 to-transparent" />
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                      <span className="ml-4 text-xs text-red-400 font-mono">// WHAT GOOGLE SEES</span>
                    </div>
                    <pre className="text-sm leading-relaxed text-muted-foreground font-mono overflow-x-auto">
                      <code>{t.problem.code}</code>
                    </pre>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="relative py-32 tech-line">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_50%,hsl(var(--primary)/0.1),transparent)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="order-2 lg:order-1">
                <StaggeredList className="space-y-4" staggerDelay={120} animation="fade-up">
                  {t.solution.steps.map((step, i) => (
                    <div
                      key={i}
                      className="group relative flex items-center gap-6 p-5 rounded-xl glass-strong hover-lift cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-display font-bold text-primary text-lg">
                        {step.num}
                      </div>
                      <span className="text-foreground font-medium text-lg">{step.text}</span>
                      <div className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  ))}
                </StaggeredList>
              </div>

              <div className="order-1 lg:order-2">
                <AnimatedSection>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs tracking-[0.2em] text-primary font-mono uppercase mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t.solution.label}
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] font-display text-foreground">
                    {t.solution.title}
                  </h2>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    {t.solution.desc}
                  </p>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32">
          <div className="absolute inset-0 cyber-grid opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs tracking-[0.2em] text-primary font-mono uppercase mb-6">
                  {t.features.label}
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] font-display">
                  <span className="gradient-text">{t.features.title}</span>
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={100} animation="fade-up">
              {t.features.items.map((feature, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-2xl glass gradient-border hover-lift overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 group-hover:neon-glow transition-shadow duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-display mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-32 tech-line">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--accent)/0.08),transparent)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs tracking-[0.2em] text-accent font-mono uppercase mb-6">
                  {t.testimonials.label}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] font-display text-foreground">
                  {t.testimonials.title}
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="grid gap-6 md:grid-cols-3" staggerDelay={120} animation="fade-up">
              {t.testimonials.items.map((item, i) => (
                <div
                  key={i}
                  className="relative p-8 rounded-2xl glass hover-lift"
                >
                  <div className="flex items-center gap-1 text-primary mb-6">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 fill-primary" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg text-foreground leading-relaxed mb-8 italic">
                    "{item.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-background text-lg">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-32">
          <div className="absolute inset-0 gradient-bg opacity-50" />
          <div className="absolute inset-0 cyber-grid opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs tracking-[0.2em] text-primary font-mono uppercase mb-6">
                  {t.pricing.label}
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] font-display">
                  <span className="gradient-text">{t.pricing.title}</span>
                </h2>
              </div>
            </AnimatedSection>

            <StaggeredList className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto" staggerDelay={150} animation="fade-up">
              {t.pricing.plans.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative p-8 rounded-2xl overflow-hidden hover-lift",
                    plan.popular 
                      ? "glass-strong neon-border" 
                      : "glass"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
                  )}
                  
                  {plan.popular && (
                    <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground font-display">
                      {t.pricing.popular}
                    </span>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-foreground font-display mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold font-display text-foreground">{plan.price}</span>
                      <span className="text-2xl font-bold text-primary">€</span>
                      <span className="text-muted-foreground font-mono">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth?mode=signup" className="block">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {t.pricing.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,hsl(var(--primary)/0.2),transparent)]" />
          <div className="orb orb-cyan w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] font-display text-foreground neon-text mb-6">
                  {t.cta.title}
                </h2>
                <p className="text-xl text-muted-foreground mb-10">
                  {t.cta.desc}
                </p>
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="h-16 px-12 text-lg">
                    {t.cta.button}
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
