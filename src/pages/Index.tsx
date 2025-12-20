import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Terminal } from "@/components/Terminal";
import { Globe3D } from "@/components/Globe3D";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap, 
  Globe2, 
  BarChart3, 
  Shield, 
  Bot,
  Check,
  Star,
  Cpu,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";

const Index = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      hero: {
        badge: "Le prerender #1 pour Lovable",
        title: "Rendez votre app",
        titleHighlight: "visible partout",
        subtitle: "Ne perdez plus de trafic à cause du JavaScript. Rendez vos sites Lovable visibles pour Google, ChatGPT, Claude et Perplexity.",
        cta: "Commencer gratuitement",
        cta2: "Voir la démo",
        stats: [
          { value: "12", unit: "ms", label: "Temps de réponse" },
          { value: "94", unit: "%", label: "Score SEO" },
          { value: "3x", unit: "", label: "Plus de trafic" },
        ],
        trusted: "Compatible avec",
      },
      problem: {
        title: "Vos Apps IA sont",
        titleHighlight: "Invisibles",
        subtitle: "Ce que Google voit vs ce que vos utilisateurs voient",
        botView: "Ce que les bots voient",
        humanView: "Ce que les humains voient",
      },
      solution: {
        badge: "Simple comme bonjour",
        title: "Comment ça marche",
        steps: [
          { num: "01", title: "Inscription", desc: "Créez votre compte en 30 secondes" },
          { num: "02", title: "Config DNS", desc: "Ajoutez un simple CNAME" },
          { num: "03", title: "Vérification", desc: "Validation automatique" },
          { num: "04", title: "C'est live", desc: "Votre site est indexable" },
        ],
      },
      features: {
        badge: "Fonctionnalités",
        title: "Tout ce qu'il vous faut",
        subtitle: "SEO niveau WordPress pour vos apps Lovable",
        items: [
          { icon: Zap, title: "Ultra-rapide", desc: "HTML généré en moins de 50ms grâce à notre infrastructure edge" },
          { icon: Globe2, title: "Multi-sites", desc: "Gérez tous vos projets Lovable depuis un seul dashboard" },
          { icon: BarChart3, title: "Analytics", desc: "Suivez les crawls de Google, Bing, ChatGPT en temps réel" },
          { icon: Shield, title: "SSL auto", desc: "Certificats gratuits générés et renouvelés automatiquement" },
          { icon: Cpu, title: "Edge global", desc: "Serveurs distribués sur 5 continents pour une latence minimale" },
          { icon: Bot, title: "AI-ready", desc: "Optimisé pour tous les crawlers IA nouvelle génération" },
        ],
      },
      edge: {
        badge: "Performance",
        title: "Servi depuis le Edge",
        subtitle: "Vos pages sont pré-générées et servies depuis des serveurs proches de vos utilisateurs pour une performance maximale",
      },
      testimonials: {
        badge: "Témoignages",
        title: "Ils nous font confiance",
        items: [
          { name: "Marc D.", role: "Fondateur @StartupAI", text: "Mon trafic organique a triplé en 2 mois. Le setup a pris 5 minutes. Je recommande à 100%." },
          { name: "Sophie L.", role: "Product Manager", text: "Enfin une solution simple pour le SEO des apps Lovable. C'est devenu indispensable pour nous." },
          { name: "Thomas R.", role: "Développeur indépendant", text: "J'ai testé plusieurs solutions de prerender, celle-ci est de loin la meilleure et la plus simple." },
        ],
      },
      pricing: {
        badge: "Tarifs",
        title: "Simple et transparent",
        subtitle: "Pas de surprises, annulez quand vous voulez",
        plans: [
          { name: "Starter", price: "7", features: ["1 site Lovable", "10k pages/mois", "Support email", "SSL automatique"], popular: false },
          { name: "Pro", price: "15", features: ["5 sites Lovable", "Pages illimitées", "Stats crawlers", "Support prioritaire", "Cache intelligent"], popular: true },
          { name: "Business", price: "39", features: ["Sites illimités", "Rapports SEO", "Support 24/7", "API access", "SLA 99.9%"], popular: false },
        ],
        cta: "Commencer",
        popular: "Populaire",
        trial: "14 jours d'essai gratuit • Sans carte bancaire",
      },
      cta: {
        title: "Prêt à booster",
        titleHighlight: "votre SEO ?",
        desc: "Rejoignez des centaines de builders qui ont déjà rendu leurs apps Lovable visibles.",
        button: "Démarrer l'essai gratuit",
      },
    },
    en: {
      hero: {
        badge: "#1 Prerender for Lovable",
        title: "Make your app",
        titleHighlight: "visible everywhere",
        subtitle: "Stop losing traffic because of JavaScript. Make your Lovable sites visible to Google, ChatGPT, Claude and Perplexity.",
        cta: "Start for free",
        cta2: "Watch demo",
        stats: [
          { value: "12", unit: "ms", label: "Response time" },
          { value: "94", unit: "%", label: "SEO Score" },
          { value: "3x", unit: "", label: "More traffic" },
        ],
        trusted: "Compatible with",
      },
      problem: {
        title: "Your AI Apps Are",
        titleHighlight: "Invisible",
        subtitle: "What Google sees vs what your users see",
        botView: "What bots see",
        humanView: "What humans see",
      },
      solution: {
        badge: "Dead simple",
        title: "How it works",
        steps: [
          { num: "01", title: "Sign up", desc: "Create your account in 30 seconds" },
          { num: "02", title: "DNS setup", desc: "Add a simple CNAME" },
          { num: "03", title: "Verification", desc: "Automatic validation" },
          { num: "04", title: "Go live", desc: "Your site is indexable" },
        ],
      },
      features: {
        badge: "Features",
        title: "Everything you need",
        subtitle: "WordPress-level SEO for your Lovable apps",
        items: [
          { icon: Zap, title: "Ultra-fast", desc: "HTML generated in under 50ms thanks to our edge infrastructure" },
          { icon: Globe2, title: "Multi-site", desc: "Manage all your Lovable projects from a single dashboard" },
          { icon: BarChart3, title: "Analytics", desc: "Track crawls from Google, Bing, ChatGPT in real-time" },
          { icon: Shield, title: "Auto SSL", desc: "Free certificates generated and renewed automatically" },
          { icon: Cpu, title: "Global edge", desc: "Servers distributed across 5 continents for minimal latency" },
          { icon: Bot, title: "AI-ready", desc: "Optimized for all next-gen AI crawlers" },
        ],
      },
      edge: {
        badge: "Performance",
        title: "Served from the Edge",
        subtitle: "Your pages are pre-generated and served from servers close to your users for maximum performance",
      },
      testimonials: {
        badge: "Testimonials",
        title: "Trusted by builders",
        items: [
          { name: "Marc D.", role: "Founder @StartupAI", text: "My organic traffic tripled in 2 months. Setup took 5 minutes. 100% recommend." },
          { name: "Sophie L.", role: "Product Manager", text: "Finally a simple solution for Lovable SEO. It's become essential for us." },
          { name: "Thomas R.", role: "Indie Developer", text: "I tested several prerender solutions, this one is by far the best and simplest." },
        ],
      },
      pricing: {
        badge: "Pricing",
        title: "Simple and transparent",
        subtitle: "No surprises, cancel anytime",
        plans: [
          { name: "Starter", price: "7", features: ["1 Lovable site", "10k pages/month", "Email support", "Auto SSL"], popular: false },
          { name: "Pro", price: "15", features: ["5 Lovable sites", "Unlimited pages", "Crawler stats", "Priority support", "Smart cache"], popular: true },
          { name: "Business", price: "39", features: ["Unlimited sites", "SEO reports", "24/7 support", "API access", "99.9% SLA"], popular: false },
        ],
        cta: "Get started",
        popular: "Popular",
        trial: "14-day free trial • No credit card required",
      },
      cta: {
        title: "Ready to boost",
        titleHighlight: "your SEO?",
        desc: "Join hundreds of builders who have already made their Lovable apps visible.",
        button: "Start free trial",
      },
    },
  };

  const t = content[lang];
  const brands = ["Google", "Bing", "ChatGPT", "Claude", "Perplexity"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2" />
        
        <div className="absolute top-40 right-0 w-[700px] h-[700px] opacity-15 pointer-events-none hidden xl:block">
          <Globe3D className="w-full h-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{t.hero.badge}</span>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-mono font-bold text-foreground mb-6 leading-[1.1]">
                {t.hero.title}<br />
                <span className="text-primary relative inline-block">
                  {t.hero.titleHighlight}
                  <span className="absolute -inset-2 bg-primary/10 blur-2xl -z-10 rounded-lg" />
                </span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <p className="text-xl text-muted-foreground font-mono max-w-2xl mb-10 leading-relaxed">
                {t.hero.subtitle}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-wrap gap-4 mb-16">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="font-mono group h-14 px-8 text-base">
                    {t.hero.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-mono h-14 px-8 text-base">
                  {t.hero.cta2}
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="flex flex-wrap gap-16">
                {t.hero.stats.map((stat, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="text-5xl md:text-6xl font-mono font-bold text-foreground group-hover:scale-105 transition-transform origin-left">
                      {stat.value}<span className="text-primary">{stat.unit}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Brands */}
      <AnimatedSection>
        <section className="py-16 border-y border-border bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground font-mono mb-8">{t.hero.trusted}</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20">
              {brands.map((brand) => (
                <span 
                  key={brand} 
                  className="text-muted-foreground/60 font-mono text-lg hover:text-primary transition-colors cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Problem Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-foreground mb-4">
                {t.problem.title} <span className="text-primary">{t.problem.titleHighlight}</span>
              </h2>
              <p className="text-lg text-muted-foreground font-mono">{t.problem.subtitle}</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <AnimatedSection animation="fade-left" delay={100}>
              <div className="space-y-4">
                <p className="text-sm font-mono text-destructive mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  {t.problem.botView}
                </p>
                <Terminal title="crawler-view.html" className="border-destructive/30">
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{"<html>"}</p>
                    <p className="text-muted-foreground pl-4">{"<body>"}</p>
                    <p className="text-destructive pl-8 font-semibold">{"<div id=\"root\"></div>"}</p>
                    <p className="text-destructive/60 pl-8 text-xs">{"<!-- ❌ Empty! Google sees nothing -->"}</p>
                    <p className="text-muted-foreground pl-4">{"</body>"}</p>
                    <p className="text-muted-foreground">{"</html>"}</p>
                  </div>
                </Terminal>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-right" delay={200}>
              <div className="space-y-4">
                <p className="text-sm font-mono text-primary mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t.problem.humanView}
                </p>
                <Terminal title="with-seo-lovable.html" className="border-primary/30 glow">
                  <div className="space-y-2 text-sm">
                    <p className="text-primary">{"<header>Navigation</header>"}</p>
                    <p className="text-primary">{"<h1>Your Amazing Title</h1>"}</p>
                    <p className="text-primary">{"<main>All your content...</main>"}</p>
                    <p className="text-primary">{"<footer>Contact & links</footer>"}</p>
                    <p className="text-primary/60 text-xs">{"<!-- ✓ 100% indexable -->"}</p>
                  </div>
                </Terminal>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Solution Steps */}
      <section className="py-32 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{t.solution.badge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-foreground">
                {t.solution.title}
              </h2>
            </div>
          </AnimatedSection>

          <StaggeredList 
            className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto"
            staggerDelay={150}
          >
            {t.solution.steps.map((step, i) => (
              <div key={i} className="relative text-center group cursor-default">
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
                  <span className="text-2xl font-mono font-bold text-primary">{step.num}</span>
                </div>
                <h3 className="text-xl font-mono font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-muted-foreground font-mono">{step.desc}</p>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{t.features.badge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-foreground mb-4">
                {t.features.title}
              </h2>
              <p className="text-lg text-muted-foreground font-mono">{t.features.subtitle}</p>
            </div>
          </AnimatedSection>

          <StaggeredList 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            staggerDelay={100}
          >
            {t.features.items.map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all duration-300 group cursor-default">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-mono font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground font-mono leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Edge Section */}
      <section className="py-32 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{t.edge.badge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-foreground mb-6">
                {t.edge.title}
              </h2>
              <p className="text-lg text-muted-foreground font-mono max-w-3xl mx-auto">{t.edge.subtitle}</p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="scale" delay={200}>
            <div className="max-w-3xl mx-auto">
              <Terminal title="$ curl -I your-site.com" className="glow">
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">HTTP/2</span> <span className="text-primary font-semibold">200 OK</span></p>
                  <p><span className="text-muted-foreground">content-type:</span> <span className="text-foreground">text/html; charset=utf-8</span></p>
                  <p><span className="text-muted-foreground">x-render-time:</span> <span className="text-primary font-semibold">12ms</span></p>
                  <p><span className="text-muted-foreground">x-cache:</span> <span className="text-primary font-semibold">HIT</span></p>
                  <p><span className="text-muted-foreground">x-edge-location:</span> <span className="text-foreground">paris-cdg-01</span></p>
                  <p><span className="text-muted-foreground">x-seo-status:</span> <span className="text-primary font-semibold">OPTIMIZED ✓</span></p>
                </div>
              </Terminal>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-mono text-primary">{t.testimonials.badge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-foreground">
                {t.testimonials.title}
              </h2>
            </div>
          </AnimatedSection>

          <StaggeredList 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            staggerDelay={150}
          >
            {t.testimonials.items.map((item, i) => (
              <div key={i} className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors group">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground font-mono mb-6 leading-relaxed">"{item.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="font-mono font-bold text-primary">{item.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-mono font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">{t.pricing.badge}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-mono font-bold text-foreground mb-4">
                {t.pricing.title}
              </h2>
              <p className="text-lg text-muted-foreground font-mono">{t.pricing.subtitle}</p>
            </div>
          </AnimatedSection>

          <StaggeredList 
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            staggerDelay={150}
          >
            {t.pricing.plans.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "relative p-10 rounded-2xl border bg-background transition-all duration-300 hover:scale-[1.02]",
                  plan.popular ? "border-primary shadow-2xl shadow-primary/20" : "border-border hover:border-primary/50"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-mono rounded-full font-semibold">
                    {t.pricing.popular}
                  </span>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-mono font-semibold text-foreground mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-mono font-bold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground font-mono">/mois</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground font-mono">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button className="w-full font-mono h-12 text-base group" variant={plan.popular ? "default" : "secondary"}>
                    {t.pricing.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </StaggeredList>

          <AnimatedSection delay={300}>
            <p className="text-center text-muted-foreground font-mono mt-12">
              ✓ {t.pricing.trial}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <AnimatedSection>
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px]" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-foreground mb-4">
              {t.cta.title}
            </h2>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-primary mb-8">
              {t.cta.titleHighlight}
            </h2>
            <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto mb-12">
              {t.cta.desc}
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="font-mono group h-16 px-10 text-lg">
                {t.cta.button}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default Index;
