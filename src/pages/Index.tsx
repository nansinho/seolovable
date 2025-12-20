import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import AnimatedCounter from "@/components/AnimatedCounter";
import TypeWriter from "@/components/TypeWriter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      hero: {
        eyebrow: "Prerendering pour React",
        title: "Rendez vos apps",
        titleAccentWords: ["visibles", "indexables", "performantes"],
        titleEnd: "sur Google",
        subtitle: "Service de prerendering qui rend vos sites React indexables par les moteurs de recherche et les crawlers IA.",
        cta: "Commencer",
        secondary: "En savoir plus",
      },
      stats: [
        { value: 12, suffix: "ms", label: "Temps de réponse moyen" },
        { value: 100, suffix: "%", label: "Contenu indexable" },
        { value: 5, suffix: "min", label: "Configuration initiale" },
      ],
      problem: {
        eyebrow: "Le problème",
        title: "Les moteurs de recherche ne voient pas votre",
        titleAccent: "contenu",
        desc: "Les applications React génèrent leur contenu via JavaScript. Les crawlers ne peuvent pas l'interpréter — votre site apparaît vide.",
      },
      solution: {
        eyebrow: "Notre solution",
        title: "Prerendering automatique et",
        titleAccent: "instantané",
        desc: "Nous interceptons les requêtes des crawlers et leur servons une version HTML statique, parfaitement lisible.",
        steps: [
          "Inscription rapide",
          "Configuration DNS",
          "Vérification automatique",
          "Site indexable",
        ],
      },
      features: {
        eyebrow: "Fonctionnalités",
        title: "Tout ce dont vous avez",
        titleAccent: "besoin",
        items: [
          { title: "Performance", desc: "HTML généré en moins de 50ms pour chaque page." },
          { title: "Multi-projets", desc: "Gérez tous vos sites depuis un seul dashboard." },
          { title: "Analytics", desc: "Suivez les crawls et l'indexation en temps réel." },
          { title: "SSL inclus", desc: "Certificats SSL gratuits et automatiques." },
          { title: "CDN global", desc: "Serveurs edge distribués dans le monde entier." },
          { title: "Compatible IA", desc: "Optimisé pour ChatGPT, Claude, Perplexity." },
        ],
      },
      testimonials: {
        eyebrow: "Témoignages",
        title: "Ce qu'ils en",
        titleAccent: "disent",
        items: [
          { name: "Marc Dubois", role: "Fondateur, TechStart", text: "Notre trafic organique a triplé en deux mois. L'intégration a pris 10 minutes." },
          { name: "Sophie Laurent", role: "Head of Product", text: "Enfin une solution qui fonctionne. Simple, efficace, sans prise de tête." },
          { name: "Thomas Renard", role: "Lead Developer", text: "La meilleure solution de prerendering que j'ai testée. Et j'en ai testé beaucoup." },
        ],
      },
      pricing: {
        eyebrow: "Tarification",
        title: "Simple et",
        titleAccent: "transparent",
        plans: [
          { 
            name: "Starter", 
            price: "7", 
            period: "/mois", 
            desc: "Pour les projets personnels",
            features: ["1 site", "10 000 pages/mois", "Support email"], 
            popular: false 
          },
          { 
            name: "Pro", 
            price: "15", 
            period: "/mois", 
            desc: "Pour les équipes en croissance",
            features: ["5 sites", "Pages illimitées", "Analytics avancés", "Support prioritaire"], 
            popular: true 
          },
          { 
            name: "Business", 
            price: "39", 
            period: "/mois", 
            desc: "Pour les entreprises",
            features: ["Sites illimités", "Rapports SEO", "Support 24/7", "Accès API"], 
            popular: false 
          },
        ],
        cta: "Choisir ce plan",
        popular: "Populaire",
      },
      cta: {
        title: "Prêt à améliorer votre",
        titleAccent: "SEO",
        desc: "Essai gratuit de 14 jours. Aucune carte bancaire requise.",
        button: "Démarrer gratuitement",
      },
      faq: {
        eyebrow: "FAQ",
        title: "Questions",
        titleAccent: "fréquentes",
        items: [
          { q: "Qu'est-ce que le prerendering ?", a: "Le prerendering génère une version HTML statique de vos pages React, permettant aux moteurs de recherche de lire votre contenu." },
          { q: "Combien de temps prend la configuration ?", a: "Moins de 5 minutes. Vous ajoutez un CNAME, on s'occupe du reste automatiquement." },
          { q: "Est-ce compatible avec tous les frameworks ?", a: "Oui, nous supportons React, Vue, Angular et tous les frameworks JavaScript modernes." },
          { q: "Puis-je annuler à tout moment ?", a: "Absolument. Aucun engagement, vous pouvez annuler votre abonnement quand vous le souhaitez." },
        ],
      },
    },
    en: {
      hero: {
        eyebrow: "Prerendering for React",
        title: "Make your apps",
        titleAccentWords: ["visible", "indexable", "performant"],
        titleEnd: "on Google",
        subtitle: "Prerendering service that makes your React sites indexable by search engines and AI crawlers.",
        cta: "Get started",
        secondary: "Learn more",
      },
      stats: [
        { value: 12, suffix: "ms", label: "Average response time" },
        { value: 100, suffix: "%", label: "Indexable content" },
        { value: 5, suffix: "min", label: "Initial setup" },
      ],
      problem: {
        eyebrow: "The problem",
        title: "Search engines can't see your",
        titleAccent: "content",
        desc: "React applications generate content via JavaScript. Crawlers can't interpret it — your site appears empty.",
      },
      solution: {
        eyebrow: "Our solution",
        title: "Automatic and instant",
        titleAccent: "prerendering",
        desc: "We intercept crawler requests and serve them a static HTML version, perfectly readable.",
        steps: [
          "Quick signup",
          "DNS configuration",
          "Automatic verification",
          "Site indexable",
        ],
      },
      features: {
        eyebrow: "Features",
        title: "Everything you",
        titleAccent: "need",
        items: [
          { title: "Performance", desc: "HTML generated in under 50ms for each page." },
          { title: "Multi-project", desc: "Manage all your sites from one dashboard." },
          { title: "Analytics", desc: "Track crawls and indexing in real-time." },
          { title: "SSL included", desc: "Free and automatic SSL certificates." },
          { title: "Global CDN", desc: "Edge servers distributed worldwide." },
          { title: "AI compatible", desc: "Optimized for ChatGPT, Claude, Perplexity." },
        ],
      },
      testimonials: {
        eyebrow: "Testimonials",
        title: "What they",
        titleAccent: "say",
        items: [
          { name: "Marc Dubois", role: "Founder, TechStart", text: "Our organic traffic tripled in two months. Integration took 10 minutes." },
          { name: "Sophie Laurent", role: "Head of Product", text: "Finally a solution that works. Simple, effective, no hassle." },
          { name: "Thomas Renard", role: "Lead Developer", text: "The best prerendering solution I've tested. And I've tested many." },
        ],
      },
      pricing: {
        eyebrow: "Pricing",
        title: "Simple and",
        titleAccent: "transparent",
        plans: [
          { 
            name: "Starter", 
            price: "7", 
            period: "/mo", 
            desc: "For personal projects",
            features: ["1 site", "10,000 pages/month", "Email support"], 
            popular: false 
          },
          { 
            name: "Pro", 
            price: "15", 
            period: "/mo", 
            desc: "For growing teams",
            features: ["5 sites", "Unlimited pages", "Advanced analytics", "Priority support"], 
            popular: true 
          },
          { 
            name: "Business", 
            price: "39", 
            period: "/mo", 
            desc: "For enterprises",
            features: ["Unlimited sites", "SEO reports", "24/7 support", "API access"], 
            popular: false 
          },
        ],
        cta: "Choose this plan",
        popular: "Popular",
      },
      cta: {
        title: "Ready to improve your",
        titleAccent: "SEO",
        desc: "14-day free trial. No credit card required.",
        button: "Start for free",
      },
      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked",
        titleAccent: "questions",
        items: [
          { q: "What is prerendering?", a: "Prerendering generates a static HTML version of your React pages, allowing search engines to read your content." },
          { q: "How long does the setup take?", a: "Less than 5 minutes. You add a CNAME, we handle the rest automatically." },
          { q: "Is it compatible with all frameworks?", a: "Yes, we support React, Vue, Angular and all modern JavaScript frameworks." },
          { q: "Can I cancel anytime?", a: "Absolutely. No commitment, you can cancel your subscription whenever you want." },
        ],
      },
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background grain">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 overflow-hidden">
          <Particles count={60} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <AnimatedSection>
                <p className="text-sm text-muted-foreground tracking-wide mb-6 font-mono animate-fade-in">
                  {t.hero.eyebrow}
                </p>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-[-0.03em] leading-[0.95]">
                  <span className="text-foreground">{t.hero.title}</span>
                  <br />
                  <TypeWriter 
                    words={t.hero.titleAccentWords} 
                    className="font-mono text-accent"
                    typingSpeed={80}
                    deletingSpeed={40}
                    delayBetweenWords={2500}
                  />
                  {" "}
                  <span className="text-foreground">{t.hero.titleEnd}</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  {t.hero.subtitle}
                </p>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="animate-float">
                      {t.hero.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button variant="ghost" size="lg" className="group">
                      {t.hero.secondary}
                      <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>

              {/* Stats */}
              <AnimatedSection delay={450}>
                <div className="mt-24 pt-12 border-t border-border">
                  <div className="grid grid-cols-3 gap-8 md:gap-16">
                    {t.stats.map((stat, i) => (
                      <div key={i} className="group" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="number-display text-4xl md:text-5xl lg:text-6xl font-mono font-medium text-foreground transition-all duration-500 group-hover:text-accent group-hover:scale-110">
                          <AnimatedCounter value={stat.value} duration={2000 + i * 300} />
                          <span className="text-muted-foreground text-2xl md:text-3xl group-hover:text-accent/70 transition-colors">{stat.suffix}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground font-mono">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

            </div>
          </div>
        </section>

        {/* AI Crawlers Logos Section */}
        <section className="py-20 border-t border-border relative">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-12">
                <p className="text-sm text-accent tracking-widest mb-4 font-mono uppercase">
                  {lang === "fr" ? "Compatibilité" : "Compatibility"}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em] leading-tight">
                  {lang === "fr" ? "Optimisé pour les " : "Optimized for "}
                  <span className="font-mono text-accent">{lang === "fr" ? "crawlers IA" : "AI crawlers"}</span>
                </h2>
                <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-10 items-center justify-items-center max-w-5xl mx-auto">
                <div className="flex items-center justify-center h-14 w-full">
                  <img src="/logos/openai.svg" alt="OpenAI" className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center justify-center h-14 w-full">
                  <img src="/logos/google.svg" alt="Google" className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center justify-center h-14 w-full">
                  <img src="/logos/claude.svg" alt="Claude" className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center justify-center h-14 w-full">
                  <img src="/logos/gemini.svg" alt="Gemini" className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center justify-center h-14 w-full col-span-2 sm:col-span-1">
                  <img src="/logos/grok.svg" alt="Grok" className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Problem */}
        <section className="py-32 border-t border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <AnimatedSection>
                  <p className="text-sm text-muted-foreground tracking-wide mb-4 font-mono animate-slide-in">
                    {t.problem.eyebrow}
                  </p>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em] leading-tight">
                    {t.problem.title} <span className="font-mono text-accent animate-pulse-subtle">{t.problem.titleAccent}</span>
                  </h2>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    {t.problem.desc}
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={150}>
                <div className="bg-card border border-border rounded-xl p-6 font-mono text-sm hover-lift border-glow transition-all duration-500 group">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-red-500/60 group-hover:bg-red-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60 group-hover:bg-yellow-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60 group-hover:bg-green-500 transition-colors" />
                    <span className="ml-4 text-muted-foreground text-xs">Ce que Google voit</span>
                  </div>
                  <pre className="text-muted-foreground leading-relaxed overflow-x-auto">
{`<html>
  <head>
    <title>Mon App React</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Aucun contenu visible -->
  </body>
</html>`}
                  </pre>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-32 border-t border-border bg-card/30 relative">
          <Particles count={20} className="opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            {/* Header centré */}
            <AnimatedSection>
              <div className="text-center mb-16">
                <p className="text-sm text-accent tracking-widest mb-4 font-mono uppercase">
                  {t.solution.eyebrow}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em] leading-tight">
                  {t.solution.title} <span className="font-mono text-accent animate-pulse-subtle">{t.solution.titleAccent}</span>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {t.solution.desc}
                </p>
                <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
              </div>
            </AnimatedSection>

            {/* Before / After Code Comparison */}
            <AnimatedSection delay={150}>
              <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
                {/* AVANT - Sans prerendering */}
                <div className="relative">
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="bg-red-500/20 text-red-400 text-xs font-mono font-medium px-3 py-1 rounded-full border border-red-500/30">
                      {lang === "fr" ? "❌ AVANT" : "❌ BEFORE"}
                    </span>
                  </div>
                  <div className="bg-card border border-red-500/20 rounded-xl p-6 font-mono text-sm h-full">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                      <span className="ml-4 text-muted-foreground text-xs">
                        {lang === "fr" ? "Ce que Google voit" : "What Google sees"}
                      </span>
                    </div>
                    <pre className="text-muted-foreground leading-relaxed overflow-x-auto text-xs md:text-sm">
{`<html>
  <head>
    <title>Mon App React</title>
  </head>
  <body>
    <div id="root">
      <!-- Rien ici ! -->
      <!-- Le contenu est généré -->
      <!-- par JavaScript -->
    </div>
    <script src="app.js"></script>
  </body>
</html>`}
                    </pre>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-red-400 text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        {lang === "fr" ? "Contenu invisible pour les bots" : "Content invisible to bots"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* APRÈS - Avec prerendering */}
                <div className="relative">
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="bg-accent/20 text-accent text-xs font-mono font-medium px-3 py-1 rounded-full border border-accent/30">
                      {lang === "fr" ? "✓ APRÈS" : "✓ AFTER"}
                    </span>
                  </div>
                  <div className="bg-card border border-accent/20 rounded-xl p-6 font-mono text-sm h-full border-glow">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-4 text-muted-foreground text-xs">
                        {lang === "fr" ? "Avec SEO Lovable" : "With SEO Lovable"}
                      </span>
                    </div>
                    <pre className="text-muted-foreground leading-relaxed overflow-x-auto text-xs md:text-sm">
{`<html>
  <head>
    <title>Mon App React</title>
    <meta name="description" content="...">
  </head>
  <body>
    <header>Navigation...</header>
    <main>
      <h1>Bienvenue</h1>
      <p>Tout le contenu visible!</p>
      <article>...</article>
    </main>
    <footer>...</footer>
  </body>
</html>`}
                    </pre>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-accent text-xs">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        {lang === "fr" ? "100% indexable par Google & IA" : "100% indexable by Google & AI"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Arrow + Result */}
            <AnimatedSection delay={250}>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-4 bg-accent/10 border border-accent/20 rounded-full px-6 py-3">
                  <span className="text-2xl">🚀</span>
                  <span className="text-foreground font-medium">
                    {lang === "fr" ? "Résultat : Votre site est visible partout" : "Result: Your site is visible everywhere"}
                  </span>
                </div>
              </div>
            </AnimatedSection>

            {/* Steps - Comment ça marche */}
            <AnimatedSection delay={350}>
              <div className="max-w-4xl mx-auto">
                <h3 className="text-center text-xl font-medium text-foreground mb-8">
                  {lang === "fr" ? "Configuration en 4 étapes" : "4-step setup"}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {t.solution.steps.map((step, i) => (
                    <div
                      key={i}
                      className="group flex flex-col items-center text-center p-6 bg-background border border-border rounded-xl hover-lift border-glow transition-all duration-500"
                    >
                      <span className="w-12 h-12 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center text-sm font-mono text-accent group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 mb-4">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-foreground font-medium text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 border-t border-border relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-16">
                <p className="text-sm text-accent tracking-widest mb-4 font-mono uppercase">
                  {t.features.eyebrow}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em]">
                  {t.features.title} <span className="font-mono text-accent animate-pulse-subtle">{t.features.titleAccent}</span>
                </h2>
                <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
              </div>
            </AnimatedSection>

            <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={80} animation="fade-up">
              {t.features.items.map((feature, i) => (
                <div
                  key={i}
                  className="bg-card p-8 md:p-10 group rounded-xl border border-border hover-lift border-glow transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                    <span className="font-mono text-accent text-sm">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-3 font-mono group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 border-t border-border bg-card/30">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <p className="text-sm text-accent tracking-widest mb-4 font-mono uppercase">
                  {t.testimonials.eyebrow}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em]">
                  {t.testimonials.title} <span className="font-mono text-accent">{t.testimonials.titleAccent}</span>
                </h2>
                <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
              </div>
            </AnimatedSection>

            <StaggeredList className="grid md:grid-cols-3 gap-8" staggerDelay={100} animation="fade-up">
              {t.testimonials.items.map((item, i) => (
                <div key={i} className="group relative p-8 bg-card border border-border rounded-xl hover-lift border-glow transition-all duration-500">
                  <span className="quote-mark absolute top-4 left-6">"</span>
                  <blockquote className="pt-8">
                    <p className="text-foreground text-lg leading-relaxed mb-8">
                      {item.text}
                    </p>
                    <footer className="flex items-center gap-4 pt-6 border-t border-border">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-mono text-accent text-sm">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground font-mono">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 border-t border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <p className="text-sm text-accent tracking-widest mb-4 font-mono uppercase">
                  {t.pricing.eyebrow}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em]">
                  {t.pricing.title} <span className="font-mono text-accent">{t.pricing.titleAccent}</span>
                </h2>
                <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
              </div>
            </AnimatedSection>

            <StaggeredList className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={120} animation="fade-up">
              {t.pricing.plans.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative p-8 rounded-lg border transition-all duration-500",
                    plan.popular 
                      ? "bg-foreground text-background border-foreground animate-glow-pulse" 
                      : "bg-background border-border card-elegant hover-lift"
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-6 bg-accent text-accent-foreground text-xs font-mono font-medium px-3 py-1 rounded-full">
                      {t.pricing.popular}
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
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0",
                          plan.popular ? "text-accent" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-sm",
                          plan.popular ? "text-background/80" : "text-muted-foreground"
                        )}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth?mode=signup" className="block">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "accent" : "outline"}
                    >
                      {t.pricing.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </StaggeredList>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 border-t border-border bg-card/30">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-16">
                <p className="text-sm text-accent tracking-widest mb-4 font-mono uppercase">
                  {t.faq.eyebrow}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-0.02em]">
                  {t.faq.title} <span className="font-mono text-accent">{t.faq.titleAccent}</span>
                </h2>
                <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {t.faq.items.map((item, i) => (
                    <AccordionItem 
                      key={i} 
                      value={`item-${i}`}
                      className="bg-background border border-border rounded-xl px-6 data-[state=open]:border-accent/30 transition-colors"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-6">
                        <span className="flex items-center gap-4">
                          <span className="text-accent font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                          {item.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-6 pl-10">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 border-t border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.02em] leading-tight">
                  <span className="text-foreground">{t.cta.title}</span>{" "}
                  <span className="font-mono text-accent">{t.cta.titleAccent}</span>
                  <span className="text-accent">?</span>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {t.cta.desc}
                </p>
                <div className="mt-10">
                  <Link to="/auth?mode=signup">
                    <Button size="lg">
                      {t.cta.button}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
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
