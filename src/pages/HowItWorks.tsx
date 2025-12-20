import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Terminal } from "@/components/Terminal";
import { Globe, Code, CheckCircle, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

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
            step.includes("✓") ? "text-primary" : "text-muted-foreground"
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
      title: "4 étapes simples",
      subtitle: "De 0 à indexé en moins de 5 minutes",
      cta: "Commencer maintenant",
      steps: [
        {
          icon: Globe,
          num: "01",
          title: "Inscription",
          desc: "Créez votre compte gratuitement",
        },
        {
          icon: Code,
          num: "02",
          title: "Configuration DNS",
          desc: "Ajoutez un simple CNAME",
          hasTerminal: true,
        },
        {
          icon: CheckCircle,
          num: "03",
          title: "Vérification auto",
          desc: "On s'occupe du reste",
          hasVerification: true,
        },
        {
          icon: Rocket,
          num: "04",
          title: "C'est live !",
          desc: "Votre site est indexable",
        },
      ],
    },
    en: {
      title: "4 simple steps",
      subtitle: "From 0 to indexed in less than 5 minutes",
      cta: "Get started now",
      steps: [
        {
          icon: Globe,
          num: "01",
          title: "Sign up",
          desc: "Create your free account",
        },
        {
          icon: Code,
          num: "02",
          title: "DNS setup",
          desc: "Add a simple CNAME",
          hasTerminal: true,
        },
        {
          icon: CheckCircle,
          num: "03",
          title: "Auto verification",
          desc: "We handle the rest",
          hasVerification: true,
        },
        {
          icon: Rocket,
          num: "04",
          title: "You're live!",
          desc: "Your site is indexable",
        },
      ],
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-mono font-bold text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground font-mono">
              {t.subtitle}
            </p>
          </div>

          {/* Steps - Simple horizontal layout */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="grid md:grid-cols-4 gap-8">
              {t.steps.map((step, index) => (
                <div key={index} className="relative group">
                  {/* Connector line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border z-0" />
                  )}
                  
                  <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    
                    {/* Number */}
                    <span className="text-xs font-mono text-primary mb-2 block">{step.num}</span>
                    
                    {/* Title */}
                    <h3 className="font-mono font-semibold text-foreground mb-1">{step.title}</h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground font-mono">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
            {/* DNS Terminal */}
            <Terminal title="dns-config.txt">
              <div className="space-y-1 text-xs">
                <p className="text-muted-foreground"># CNAME record</p>
                <p><span className="text-muted-foreground">Type:</span> <span className="text-primary">CNAME</span></p>
                <p><span className="text-muted-foreground">Name:</span> <span className="text-primary">www</span></p>
                <p><span className="text-muted-foreground">Value:</span> <span className="text-primary">proxy.seo-lovable.com</span></p>
              </div>
            </Terminal>

            {/* Verification Terminal */}
            <Terminal title="verification.sh">
              <VerificationAnimation />
            </Terminal>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="font-mono group">
                {t.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
