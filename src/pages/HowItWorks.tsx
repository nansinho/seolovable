import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Terminal } from "@/components/Terminal";
import { Globe, Code, CheckCircle, Rocket, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const VerificationAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { lang } = useI18n();
  
  const verificationSteps = lang === "fr" ? [
    { text: "Vérification DNS...", status: "loading" },
    { text: "DNS vérifié ✓", status: "success" },
    { text: "Génération SSL...", status: "loading" },
    { text: "SSL activé ✓", status: "success" },
    { text: "Test prerender...", status: "loading" },
    { text: "Prerender OK ✓", status: "success" },
    { text: "Configuration complète!", status: "complete" },
  ] : [
    { text: "Verifying DNS...", status: "loading" },
    { text: "DNS verified ✓", status: "success" },
    { text: "Generating SSL...", status: "loading" },
    { text: "SSL activated ✓", status: "success" },
    { text: "Testing prerender...", status: "loading" },
    { text: "Prerender OK ✓", status: "success" },
    { text: "Configuration complete!", status: "complete" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % verificationSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [verificationSteps.length]);

  return (
    <div className="space-y-2">
      {verificationSteps.slice(0, currentStep + 1).map((step, index) => (
        <p
          key={index}
          className={`font-mono text-sm ${
            step.status === "success"
              ? "text-primary"
              : step.status === "complete"
              ? "text-primary font-semibold"
              : "text-muted-foreground"
          }`}
        >
          {index === currentStep && step.status === "loading" ? (
            <span className="animate-pulse">{step.text}</span>
          ) : (
            step.text
          )}
        </p>
      ))}
    </div>
  );
};

const HowItWorks = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      badge: "Guide complet",
      title: "Comment ça marche ?",
      subtitle: "De l'inscription à l'indexation Google en 4 étapes simples. Configuration en moins de 5 minutes.",
      ctaTitle: "Prêt à booster votre SEO ?",
      ctaSubtitle: "Commencez votre essai gratuit de 14 jours maintenant. Pas de carte bancaire requise.",
      ctaButton: "Commencer gratuitement",
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
      badge: "Complete guide",
      title: "How it works?",
      subtitle: "From signup to Google indexation in 4 simple steps. Configuration in less than 5 minutes.",
      ctaTitle: "Ready to boost your SEO?",
      ctaSubtitle: "Start your 14-day free trial now. No credit card required.",
      ctaButton: "Start for free",
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary/30 bg-primary/5 mb-6 opacity-0 animate-fade-in">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-primary">{t.badge}</span>
              </div>
              <h1 
                className="text-4xl md:text-5xl font-bold font-mono text-foreground mb-6 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                {t.title}
              </h1>
              <p 
                className="text-lg text-muted-foreground font-mono opacity-0 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {t.steps.map((step, index) => (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 items-center opacity-0 animate-fade-in-up`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {/* Content */}
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {t.step} {step.number}
                        </span>
                        <h2 className="text-2xl font-bold font-mono text-foreground">
                          {step.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-muted-foreground font-mono mb-6">
                      {step.description}
                    </p>

                    <ul className="space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-mono text-sm text-muted-foreground">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    {step.terminal && (
                      <Terminal title="dns-config.txt">
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground"># Add this CNAME to your DNS</p>
                          <p>
                            <span className="text-muted-foreground">Type:</span>{" "}
                            <span className="text-primary">CNAME</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Name:</span>{" "}
                            <span className="text-primary">@</span>{" "}
                            <span className="text-muted-foreground">or</span>{" "}
                            <span className="text-primary">www</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Value:</span>{" "}
                            <span className="text-primary">proxy.seo-lovable.com</span>
                          </p>
                          <p className="text-primary pt-2"># Done! ✓</p>
                        </div>
                      </Terminal>
                    )}

                    {step.verification && (
                      <Terminal title="verification.sh">
                        <VerificationAnimation />
                      </Terminal>
                    )}

                    {!step.terminal && !step.verification && (
                      <div className="p-8 rounded-lg border border-border bg-card flex items-center justify-center min-h-[200px]">
                        <step.icon className="w-20 h-20 text-primary/30" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold font-mono text-foreground mb-6">
                {t.ctaTitle}
              </h2>
              <p className="text-muted-foreground font-mono mb-8">
                {t.ctaSubtitle}
              </p>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="font-mono group">
                  {t.ctaButton}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
