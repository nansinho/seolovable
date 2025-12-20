import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Terminal } from "@/components/Terminal";
import { Globe, Code, CheckCircle, Rocket, ArrowRight, Zap, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const VerificationAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { lang } = useI18n();
  
  const verificationSteps = lang === "fr" ? [
    { text: "> Vérification DNS...", status: "loading" },
    { text: "✓ DNS vérifié", status: "success" },
    { text: "> Génération SSL...", status: "loading" },
    { text: "✓ SSL activé", status: "success" },
    { text: "> Test prerender...", status: "loading" },
    { text: "✓ Prerender OK", status: "success" },
    { text: "★ Configuration complète!", status: "complete" },
  ] : [
    { text: "> Verifying DNS...", status: "loading" },
    { text: "✓ DNS verified", status: "success" },
    { text: "> Generating SSL...", status: "loading" },
    { text: "✓ SSL activated", status: "success" },
    { text: "> Testing prerender...", status: "loading" },
    { text: "✓ Prerender OK", status: "success" },
    { text: "★ Configuration complete!", status: "complete" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % verificationSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [verificationSteps.length]);

  return (
    <div className="space-y-1.5">
      {verificationSteps.slice(0, currentStep + 1).map((step, index) => (
        <p
          key={index}
          className={`font-mono text-sm transition-all duration-300 ${
            step.status === "success"
              ? "text-primary"
              : step.status === "complete"
              ? "text-primary font-semibold"
              : "text-muted-foreground"
          } ${index === currentStep ? "translate-x-0" : ""}`}
          style={{
            animation: index === currentStep ? "slideInLeft 0.3s ease-out" : undefined
          }}
        >
          {index === currentStep && step.status === "loading" ? (
            <span className="inline-flex items-center gap-2">
              {step.text}
              <span className="inline-flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </span>
          ) : (
            step.text
          )}
        </p>
      ))}
    </div>
  );
};

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span>
      {displayText}
      {displayText.length < text.length && started && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
      )}
    </span>
  );
};

const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
};

const HowItWorks = () => {
  const { lang } = useI18n();
  const [activeStep, setActiveStep] = useState(0);

  const content = {
    fr: {
      badge: "Configuration en 5 minutes",
      title: "Comment ça marche ?",
      subtitle: "De l'inscription à l'indexation Google en 4 étapes simples.",
      stats: [
        { value: 5, suffix: "min", label: "Configuration" },
        { value: 24, suffix: "h", label: "Indexation" },
        { value: 200, suffix: "%", label: "Trafic" },
      ],
      ctaTitle: "Prêt à booster votre SEO ?",
      ctaSubtitle: "Commencez votre essai gratuit de 14 jours maintenant. Pas de carte bancaire requise.",
      ctaButton: "Commencer gratuitement",
      watchDemo: "Voir la démo",
      step: "ÉTAPE",
      steps: [
        {
          icon: Globe,
          number: "01",
          title: "Créez votre compte",
          description: "Inscrivez-vous gratuitement et accédez à votre dashboard en quelques secondes.",
          details: [
            "Inscription rapide par email",
            "Pas de carte bancaire requise",
            "14 jours d'essai gratuit",
          ],
        },
        {
          icon: Code,
          number: "02",
          title: "Ajoutez votre site Lovable",
          description: "Entrez l'URL de votre site Lovable et configurez un simple CNAME DNS.",
          details: [
            "Copiez votre URL Lovable",
            "Ajoutez un enregistrement CNAME",
            "Configuration en 30 secondes",
          ],
          terminal: true,
        },
        {
          icon: CheckCircle,
          number: "03",
          title: "Vérification automatique",
          description: "Notre système vérifie automatiquement votre configuration DNS et SSL.",
          details: [
            "Vérification DNS instantanée",
            "Certificat SSL automatique",
            "Première page pré-rendue",
          ],
          verification: true,
        },
        {
          icon: Rocket,
          number: "04",
          title: "Votre SEO est live !",
          description: "Google peut maintenant crawler tout votre contenu. Suivez vos stats en temps réel.",
          details: [
            "Indexation en quelques heures",
            "Dashboard de monitoring",
            "Alertes en temps réel",
          ],
        },
      ],
    },
    en: {
      badge: "5-minute setup",
      title: "How it works?",
      subtitle: "From signup to Google indexation in 4 simple steps.",
      stats: [
        { value: 5, suffix: "min", label: "Setup" },
        { value: 24, suffix: "h", label: "Indexation" },
        { value: 200, suffix: "%", label: "Traffic" },
      ],
      ctaTitle: "Ready to boost your SEO?",
      ctaSubtitle: "Start your 14-day free trial now. No credit card required.",
      ctaButton: "Start for free",
      watchDemo: "Watch demo",
      step: "STEP",
      steps: [
        {
          icon: Globe,
          number: "01",
          title: "Create your account",
          description: "Sign up for free and access your dashboard in seconds.",
          details: [
            "Quick email signup",
            "No credit card required",
            "14-day free trial",
          ],
        },
        {
          icon: Code,
          number: "02",
          title: "Add your Lovable site",
          description: "Enter your Lovable site URL and configure a simple DNS CNAME.",
          details: [
            "Copy your Lovable URL",
            "Add a CNAME record",
            "30-second configuration",
          ],
          terminal: true,
        },
        {
          icon: CheckCircle,
          number: "03",
          title: "Automatic verification",
          description: "Our system automatically verifies your DNS and SSL configuration.",
          details: [
            "Instant DNS verification",
            "Automatic SSL certificate",
            "First page pre-rendered",
          ],
          verification: true,
        },
        {
          icon: Rocket,
          number: "04",
          title: "Your SEO is live!",
          description: "Google can now crawl all your content. Track your stats in real-time.",
          details: [
            "Indexation in hours",
            "Monitoring dashboard",
            "Real-time alerts",
          ],
        },
      ],
    },
  };

  const t = content[lang];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
          
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 opacity-0 animate-fade-in"
              >
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-mono text-primary">{t.badge}</span>
              </div>
              
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold font-mono text-foreground mb-6 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <TypewriterText text={t.title} delay={300} />
              </h1>
              
              <p 
                className="text-xl text-muted-foreground font-mono mb-12 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                {t.subtitle}
              </p>

              {/* Stats */}
              <div 
                className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                {t.stats.map((stat, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-4xl md:text-5xl font-mono font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                      <AnimatedCounter target={stat.value} duration={2000 + i * 500} />
                      <span className="text-2xl">{stat.suffix}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div 
                className="flex flex-wrap justify-center gap-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="font-mono group">
                    {t.ctaButton}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-mono group">
                  <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {t.watchDemo}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Step Navigation */}
        <section className="py-8 border-y border-border bg-card/50 sticky top-16 z-40 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-2 md:gap-4">
              {t.steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveStep(index);
                    document.getElementById(`step-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-300 ${
                    activeStep === index 
                      ? "bg-primary text-primary-foreground scale-105" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <span className="hidden md:inline">{step.number}</span>
                  <step.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Steps with Timeline */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden lg:block" />
            
            <div className="space-y-32">
              {t.steps.map((step, index) => (
                <div
                  key={index}
                  id={`step-${index}`}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary hidden lg:block animate-pulse" />
                  
                  <div
                    className={`grid lg:grid-cols-2 gap-12 items-center`}
                  >
                    {/* Content */}
                    <div 
                      className={`${index % 2 === 1 ? "lg:order-2 lg:pl-16" : "lg:pr-16"} opacity-0 animate-fade-in`}
                      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    >
                      {/* Step number badge */}
                      <div className="inline-flex items-center gap-3 mb-6">
                        <div className={`w-16 h-16 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center transition-all duration-500 ${
                          activeStep === index ? "scale-110 border-primary bg-primary/20 shadow-lg shadow-primary/20" : ""
                        }`}>
                          <step.icon className={`w-8 h-8 text-primary transition-transform duration-500 ${
                            activeStep === index ? "scale-110" : ""
                          }`} />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-primary font-semibold tracking-wider">
                            {t.step} {step.number}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-bold font-mono text-foreground">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <p className="text-lg text-muted-foreground font-mono mb-8 leading-relaxed">
                        {step.description}
                      </p>

                      <ul className="space-y-4">
                        {step.details.map((detail, i) => (
                          <li 
                            key={i} 
                            className="flex items-center gap-4 group opacity-0 animate-fade-in"
                            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                          >
                            <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                              <CheckCircle className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual */}
                    <div 
                      className={`${index % 2 === 1 ? "lg:order-1 lg:pr-16" : "lg:pl-16"} opacity-0 animate-slide-in-right`}
                      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    >
                      {step.terminal && (
                        <div className="relative group">
                          <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all" />
                          <Terminal title="dns-config.txt" className="relative">
                            <div className="space-y-2 text-sm">
                              <p className="text-muted-foreground"># Add this CNAME to your DNS</p>
                              <div className="h-px bg-border my-3" />
                              <p className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Type:</span>
                                <span className="text-primary font-semibold">CNAME</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Name:</span>
                                <span className="text-primary">@</span>
                                <span className="text-muted-foreground">or</span>
                                <span className="text-primary">www</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Value:</span>
                                <span className="text-primary font-semibold">proxy.seo-lovable.com</span>
                              </p>
                              <div className="h-px bg-border my-3" />
                              <p className="text-primary font-semibold">✓ Done!</p>
                            </div>
                          </Terminal>
                        </div>
                      )}

                      {step.verification && (
                        <div className="relative group">
                          <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all" />
                          <Terminal title="$ ./verify.sh" className="relative">
                            <VerificationAnimation />
                          </Terminal>
                        </div>
                      )}

                      {!step.terminal && !step.verification && (
                        <div className="relative group">
                          <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all" />
                          <div className="relative p-12 rounded-xl border border-border bg-card flex items-center justify-center min-h-[280px] overflow-hidden">
                            <step.icon className={`w-24 h-24 text-primary/30 transition-all duration-500 ${
                              activeStep === index ? "scale-125 text-primary/50" : ""
                            }`} />
                            
                            {/* Animated circles */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`w-40 h-40 rounded-full border border-primary/20 transition-all duration-1000 ${
                                activeStep === index ? "scale-150 opacity-0" : "scale-100 opacity-100"
                              }`} />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`w-32 h-32 rounded-full border border-primary/30 transition-all duration-700 delay-200 ${
                                activeStep === index ? "scale-150 opacity-0" : "scale-100 opacity-100"
                              }`} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-card border-t border-border relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold font-mono text-foreground mb-6 opacity-0 animate-fade-in">
                {t.ctaTitle}
              </h2>
              <p className="text-lg text-muted-foreground font-mono mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {t.ctaSubtitle}
              </p>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="font-mono group text-lg px-8 py-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  {t.ctaButton}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
