import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { Terminal } from "@/components/Terminal";
import { Globe, Code, CheckCircle, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection, StaggeredList } from "@/hooks/useScrollAnimation";

const VerificationAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { lang } = useI18n();
  
  const verificationSteps = lang === "fr" ? [
    "Vérification DNS...",
    "DNS vérifié ✓",
    "Génération SSL...",
    "SSL activé ✓",
    "Test prerender...",
    "Prerender OK ✓",
  ] : [
    "Verifying DNS...",
    "DNS verified ✓",
    "Generating SSL...",
    "SSL activated ✓",
    "Testing prerender...",
    "Prerender OK ✓",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % verificationSteps.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [verificationSteps.length]);

  return (
    <div className="space-y-1">
      {verificationSteps.slice(0, currentStep + 1).map((step, index) => (
        <p
          key={index}
          className={`font-mono text-xs ${
            step.includes("✓") ? "text-accent" : "text-muted-foreground"
          }`}
        >
          {step}
        </p>
      ))}
    </div>
  );
};

const HowItWorks = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      eyebrow: "Comment ça marche",
      title: "4 étapes",
      titleAccent: "simples",
      subtitle: "De 0 à indexé en moins de 5 minutes",
      cta: "Commencer maintenant",
      steps: [
        {
          icon: Globe,
          num: "01",
          title: "Inscription",
          desc: "Créez votre compte gratuitement en quelques secondes",
        },
        {
          icon: Code,
          num: "02",
          title: "Configuration DNS",
          desc: "Ajoutez un simple enregistrement CNAME à votre domaine",
        },
        {
          icon: CheckCircle,
          num: "03",
          title: "Vérification auto",
          desc: "Notre système vérifie et configure tout automatiquement",
        },
        {
          icon: Rocket,
          num: "04",
          title: "C'est live !",
          desc: "Votre site est maintenant 100% indexable par Google",
        },
      ],
    },
    en: {
      eyebrow: "How it works",
      title: "4 simple",
      titleAccent: "steps",
      subtitle: "From 0 to indexed in less than 5 minutes",
      cta: "Get started now",
      steps: [
        {
          icon: Globe,
          num: "01",
          title: "Sign up",
          desc: "Create your free account in seconds",
        },
        {
          icon: Code,
          num: "02",
          title: "DNS setup",
          desc: "Add a simple CNAME record to your domain",
        },
        {
          icon: CheckCircle,
          num: "03",
          title: "Auto verification",
          desc: "Our system verifies and configures everything automatically",
        },
        {
          icon: Rocket,
          num: "04",
          title: "You're live!",
          desc: "Your site is now 100% indexable by Google",
        },
      ],
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background grain">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <section className="relative overflow-hidden pb-20">
            <Particles count={30} />
            <AnimatedSection>
              <div className="text-center relative z-10">
                <p className="text-sm text-accent tracking-widest mb-6 font-mono uppercase animate-fade-up">
                  {t.eyebrow}
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
                  <span className="text-foreground">{t.title}</span>{" "}
                  <span className="font-mono text-accent animate-pulse-subtle">{t.titleAccent}</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
                  {t.subtitle}
                </p>
                <div className="mt-8 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto animate-fade-up" style={{ animationDelay: "300ms" }} />
              </div>
            </AnimatedSection>
          </section>

          {/* Steps */}
          <section className="py-20 border-t border-border">
            <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={100} animation="fade-up">
              {t.steps.map((step, index) => (
                <div key={index} className="group relative">
                  {/* Connector line */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-border z-0" />
                  )}
                  
                  <div className="relative z-10 p-8 bg-card border border-border rounded-xl hover-lift border-glow transition-all duration-500">
                    {/* Icon */}
                    <div className="w-14 h-14 mb-6 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <step.icon className="w-6 h-6 text-accent" />
                    </div>
                    
                    {/* Number */}
                    <span className="text-xs font-mono text-accent mb-3 block">{step.num}</span>
                    
                    {/* Title */}
                    <h3 className="font-mono font-semibold text-foreground text-lg mb-2">{step.title}</h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </StaggeredList>
          </section>

          {/* Details Section */}
          <section className="py-20 border-t border-border">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {/* DNS Terminal */}
                <div className="bg-card border border-border rounded-xl p-6 font-mono text-sm hover-lift border-glow transition-all duration-500">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="ml-4 text-muted-foreground text-xs">dns-config.txt</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground"># CNAME record</p>
                    <p><span className="text-muted-foreground">Type:</span> <span className="text-accent">CNAME</span></p>
                    <p><span className="text-muted-foreground">Name:</span> <span className="text-accent">www</span></p>
                    <p><span className="text-muted-foreground">Value:</span> <span className="text-accent">proxy.votredomaine.com</span></p>
                  </div>
                </div>

                {/* Verification Terminal */}
                <div className="bg-card border border-border rounded-xl p-6 font-mono text-sm hover-lift border-glow transition-all duration-500">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="ml-4 text-muted-foreground text-xs">verification.sh</span>
                  </div>
                  <VerificationAnimation />
                </div>
              </div>
            </AnimatedSection>
          </section>

          {/* CTA */}
          <section className="py-20 border-t border-border">
            <AnimatedSection>
              <div className="text-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="group">
                    {t.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
