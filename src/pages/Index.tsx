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
  Clock, 
  Bot,
  Check,
  Star,
  Code,
  CheckCircle,
  Rocket,
  Server,
  Cpu,
  FileCode
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
        ],
        trusted: "Compatible avec",
      },
      problem: {
        title: "Vos Apps IA sont Invisibles",
        subtitle: "Ce que Google voit vs ce que vos utilisateurs voient",
        botView: "Ce que les bots voient",
        humanView: "Ce que les humains voient",
      },
      solution: {
        title: "Comment SEO Lovable Résout le Problème",
        steps: [
          { num: "01", title: "Inscription", desc: "Créez votre compte en 30 secondes" },
          { num: "02", title: "Config DNS", desc: "Ajoutez un simple CNAME" },
          { num: "03", title: "Vérification", desc: "Validation automatique" },
          { num: "04", title: "C'est live", desc: "Votre site est indexable" },
        ],
      },
      features: {
        title: "SEO niveau WordPress pour vos apps Lovable",
        subtitle: "Tout ce dont vous avez besoin pour être visible",
        items: [
          { icon: Zap, title: "Prerender ultra-rapide", desc: "HTML généré en moins de 50ms" },
          { icon: Globe2, title: "Multi-sites", desc: "Gérez tous vos projets Lovable" },
          { icon: BarChart3, title: "Stats en temps réel", desc: "Suivez les crawls de Google, Bing, ChatGPT" },
          { icon: Shield, title: "SSL automatique", desc: "Certificats gratuits et renouvelés auto" },
          { icon: Cpu, title: "Edge computing", desc: "Serveurs distribués mondialement" },
          { icon: Bot, title: "AI-ready", desc: "Optimisé pour les crawlers IA" },
        ],
      },
      builderFeatures: {
        title: "Fait pour les builders IA",
        subtitle: "Gardez votre stack. On s'occupe du SEO.",
        items: [
          { title: "100% No-Code", desc: "Aucune modification de votre code Lovable" },
          { title: "Compatible Lovable", desc: "Fonctionne avec tous les projets Lovable" },
          { title: "Mise en cache intelligente", desc: "Cache automatique qui s'adapte à vos updates" },
          { title: "Multi-pages", desc: "Toutes vos routes sont pré-rendues automatiquement" },
        ],
      },
      edge: {
        title: "HTML statique servi depuis le Edge",
        subtitle: "Vos pages sont pré-générées et servies depuis des serveurs proches de vos utilisateurs",
      },
      testimonials: {
        title: "Ce que disent nos utilisateurs",
        items: [
          { name: "Marc D.", role: "Fondateur @StartupAI", text: "Mon trafic organique a triplé en 2 mois. Le setup a pris 5 minutes." },
          { name: "Sophie L.", role: "Product Manager", text: "Enfin une solution simple pour le SEO des apps Lovable. Indispensable." },
          { name: "Thomas R.", role: "Développeur indépendant", text: "J'ai testé plusieurs solutions, celle-ci est de loin la meilleure." },
        ],
      },
      pricing: {
        title: "Corrigez votre SEO. Gardez votre stack.",
        subtitle: "Tarifs simples, sans surprise",
        plans: [
          { name: "Basic", price: "7", features: ["1 site", "10k pages/mois", "Support email"], popular: false },
          { name: "Pro", price: "15", features: ["5 sites", "Pages illimitées", "Stats bots", "Support prioritaire"], popular: true },
          { name: "Enterprise", price: "39", features: ["Sites illimités", "Rapports SEO", "Support 24/7", "API access"], popular: false },
        ],
        cta: "Commencer",
        popular: "Populaire",
      },
      cta: {
        title: "Arrêtez de perdre du trafic",
        subtitle: "sur des pages invisibles",
        desc: "Rendez vos apps Lovable visibles pour Google et les crawlers IA dès aujourd'hui.",
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
        ],
        trusted: "Compatible with",
      },
      problem: {
        title: "Your AI Apps Are Invisible",
        subtitle: "What Google sees vs what your users see",
        botView: "What bots see",
        humanView: "What humans see",
      },
      solution: {
        title: "How SEO Lovable Fixes It",
        steps: [
          { num: "01", title: "Sign up", desc: "Create your account in 30 seconds" },
          { num: "02", title: "DNS setup", desc: "Add a simple CNAME" },
          { num: "03", title: "Verification", desc: "Automatic validation" },
          { num: "04", title: "Go live", desc: "Your site is indexable" },
        ],
      },
      features: {
        title: "WordPress-level SEO for your Lovable apps",
        subtitle: "Everything you need to be visible",
        items: [
          { icon: Zap, title: "Ultra-fast prerender", desc: "HTML generated in under 50ms" },
          { icon: Globe2, title: "Multi-site", desc: "Manage all your Lovable projects" },
          { icon: BarChart3, title: "Real-time stats", desc: "Track crawls from Google, Bing, ChatGPT" },
          { icon: Shield, title: "Auto SSL", desc: "Free certificates, auto-renewed" },
          { icon: Cpu, title: "Edge computing", desc: "Globally distributed servers" },
          { icon: Bot, title: "AI-ready", desc: "Optimized for AI crawlers" },
        ],
      },
      builderFeatures: {
        title: "Built for AI builders",
        subtitle: "Keep your stack. We handle SEO.",
        items: [
          { title: "100% No-Code", desc: "No changes to your Lovable code" },
          { title: "Lovable Compatible", desc: "Works with all Lovable projects" },
          { title: "Smart caching", desc: "Auto cache that adapts to your updates" },
          { title: "Multi-page", desc: "All your routes are pre-rendered automatically" },
        ],
      },
      edge: {
        title: "Static HTML served from the Edge",
        subtitle: "Your pages are pre-generated and served from servers close to your users",
      },
      testimonials: {
        title: "What our users say",
        items: [
          { name: "Marc D.", role: "Founder @StartupAI", text: "My organic traffic tripled in 2 months. Setup took 5 minutes." },
          { name: "Sophie L.", role: "Product Manager", text: "Finally a simple solution for Lovable SEO. Essential." },
          { name: "Thomas R.", role: "Indie Developer", text: "I tested several solutions, this one is by far the best." },
        ],
      },
      pricing: {
        title: "Fix your SEO. Keep your stack.",
        subtitle: "Simple pricing, no surprises",
        plans: [
          { name: "Basic", price: "7", features: ["1 site", "10k pages/month", "Email support"], popular: false },
          { name: "Pro", price: "15", features: ["5 sites", "Unlimited pages", "Bot stats", "Priority support"], popular: true },
          { name: "Enterprise", price: "39", features: ["Unlimited sites", "SEO reports", "24/7 support", "API access"], popular: false },
        ],
        cta: "Get started",
        popular: "Popular",
      },
      cta: {
        title: "Stop losing traffic",
        subtitle: "to invisible pages",
        desc: "Make your Lovable apps visible to Google and AI crawlers today.",
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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-40 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none hidden lg:block">
          <Globe3D className="w-full h-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-primary">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-foreground mb-4 leading-tight">
              {t.hero.title}<br />
              <span className="text-primary">{t.hero.titleHighlight}</span>
            </h1>
            
            <p className="text-lg text-muted-foreground font-mono max-w-2xl mb-8">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="font-mono group">
                  {t.hero.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-mono">
                {t.hero.cta2}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mb-12">
              {t.hero.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl font-mono font-bold text-foreground">
                    {stat.value}<span className="text-primary">{stat.unit}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground font-mono mb-6">{t.hero.trusted}</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {brands.map((brand) => (
              <span key={brand} className="text-muted-foreground font-mono text-sm hover:text-foreground transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              {t.problem.title}
            </h2>
            <p className="text-muted-foreground font-mono">{t.problem.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-3">{t.problem.botView}</p>
              <Terminal title="crawler-view.html">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{"<html>"}</p>
                  <p className="text-muted-foreground pl-2">{"<body>"}</p>
                  <p className="text-destructive pl-4">{"<div id=\"root\"></div>"}</p>
                  <p className="text-muted-foreground pl-4 text-xs">{"<!-- Empty! No content -->"}</p>
                  <p className="text-muted-foreground pl-2">{"</body>"}</p>
                  <p className="text-muted-foreground">{"</html>"}</p>
                </div>
              </Terminal>
            </div>
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-3">{t.problem.humanView}</p>
              <Terminal title="rendered-view.html" className="border-primary/30">
                <div className="space-y-1 text-sm">
                  <p className="text-primary">{"<header>Navigation...</header>"}</p>
                  <p className="text-primary">{"<h1>Your Amazing Title</h1>"}</p>
                  <p className="text-primary">{"<main>All your content...</main>"}</p>
                  <p className="text-primary">{"<footer>Links & info</footer>"}</p>
                  <p className="text-primary text-xs">{"<!-- Full content! ✓ -->"}</p>
                </div>
              </Terminal>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Steps */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground text-center mb-16">
            {t.solution.title}
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {t.solution.steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border" />
                )}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <span className="font-mono font-bold text-primary">{step.num}</span>
                </div>
                <h3 className="font-mono font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-mono">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              {t.features.title}
            </h2>
            <p className="text-muted-foreground font-mono">{t.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.features.items.map((feature, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-mono font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-mono">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Builder Features */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              {t.builderFeatures.title}
            </h2>
            <p className="text-muted-foreground font-mono">{t.builderFeatures.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {t.builderFeatures.items.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-lg border border-border bg-background">
                <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edge Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              {t.edge.title}
            </h2>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">{t.edge.subtitle}</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Terminal title="response-headers.txt">
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">HTTP/2</span> <span className="text-primary">200 OK</span></p>
                <p><span className="text-muted-foreground">content-type:</span> <span className="text-foreground">text/html; charset=utf-8</span></p>
                <p><span className="text-muted-foreground">x-render-time:</span> <span className="text-primary">12ms</span></p>
                <p><span className="text-muted-foreground">x-cache:</span> <span className="text-primary">HIT</span></p>
                <p><span className="text-muted-foreground">cf-ray:</span> <span className="text-foreground">edge-paris-01</span></p>
              </div>
            </Terminal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground text-center mb-16">
            {t.testimonials.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.testimonials.items.map((item, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-background">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground font-mono text-sm mb-4">"{item.text}"</p>
                <div>
                  <p className="font-mono font-semibold text-foreground text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-muted-foreground font-mono">{t.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {t.pricing.plans.map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "relative p-8 rounded-lg border bg-card transition-all",
                  plan.popular ? "border-primary" : "border-border hover:border-primary/50"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono rounded-full">
                    {t.pricing.popular}
                  </span>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-mono font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-mono font-bold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground font-mono text-sm">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground font-mono">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button className="w-full font-mono" variant={plan.popular ? "default" : "secondary"}>
                    {t.pricing.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-foreground mb-2">
            {t.cta.title}
          </h2>
          <h2 className="text-4xl md:text-5xl font-mono font-bold text-primary mb-6">
            {t.cta.subtitle}
          </h2>
          <p className="text-muted-foreground font-mono max-w-xl mx-auto mb-8">
            {t.cta.desc}
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="font-mono group">
              {t.cta.button}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
