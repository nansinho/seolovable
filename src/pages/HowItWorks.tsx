import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Terminal } from "@/components/Terminal";
import { Globe, Code, CheckCircle, Rocket, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const steps = [
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
];

const VerificationAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const verificationSteps = [
    { text: "Vérification DNS...", status: "loading" },
    { text: "DNS vérifié ✓", status: "success" },
    { text: "Génération SSL...", status: "loading" },
    { text: "SSL activé ✓", status: "success" },
    { text: "Test prerender...", status: "loading" },
    { text: "Prerender OK ✓", status: "success" },
    { text: "Configuration complète!", status: "complete" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % verificationSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      {verificationSteps.slice(0, currentStep + 1).map((step, index) => (
        <p
          key={index}
          className={`font-code text-sm ${
            step.status === "success"
              ? "text-primary"
              : step.status === "complete"
              ? "text-secondary"
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 relative matrix-bg">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/10 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-code text-primary">Guide complet</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-code text-primary mb-6">
                Comment ça marche ?
              </h1>
              <p className="text-lg text-muted-foreground font-code">
                De l'inscription à l'indexation Google en 4 étapes simples.
                Configuration en moins de 5 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-green">
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs font-code text-muted-foreground">
                          ÉTAPE {step.number}
                        </span>
                        <h2 className="text-2xl font-bold font-code text-primary">
                          {step.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-muted-foreground font-code mb-6">
                      {step.description}
                    </p>

                    <ul className="space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-code text-sm text-muted-foreground">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    {step.terminal && (
                      <Terminal title="dns-configuration.txt">
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground"># Ajoutez ce CNAME à votre DNS</p>
                          <p>
                            <span className="text-secondary">Type:</span>{" "}
                            <span className="text-primary">CNAME</span>
                          </p>
                          <p>
                            <span className="text-secondary">Nom:</span>{" "}
                            <span className="text-primary">@</span>{" "}
                            <span className="text-muted-foreground">ou</span>{" "}
                            <span className="text-primary">www</span>
                          </p>
                          <p>
                            <span className="text-secondary">Valeur:</span>{" "}
                            <span className="text-primary">proxy.seo-lovable.com</span>
                          </p>
                          <p className="text-muted-foreground pt-2"># C'est tout ! ✓</p>
                        </div>
                      </Terminal>
                    )}

                    {step.verification && (
                      <Terminal title="verification-auto.sh" className="scanline">
                        <VerificationAnimation />
                      </Terminal>
                    )}

                    {!step.terminal && !step.verification && (
                      <div className="p-8 rounded-lg border border-border bg-card">
                        <step.icon className="w-24 h-24 text-primary/20 mx-auto" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold font-code text-primary mb-6">
                Prêt à booster votre SEO ?
              </h2>
              <p className="text-muted-foreground font-code mb-8">
                Commencez votre essai gratuit de 14 jours maintenant.
                Pas de carte bancaire requise.
              </p>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="font-code glow-green group">
                  Commencer gratuitement
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