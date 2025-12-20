import { Globe, Code, CheckCircle, Rocket } from "lucide-react";

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Inscrivez-vous",
    description: "Créez votre compte et ajoutez votre URL Lovable en quelques clics",
  },
  {
    icon: Code,
    step: "02",
    title: "Ajoutez un CNAME",
    description: "Configuration DNS simple, copier-coller en 30 secondes",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Vérification auto",
    description: "Notre système vérifie automatiquement votre configuration",
  },
  {
    icon: Rocket,
    step: "04",
    title: "C'est live !",
    description: "Votre site est indexé – suivez les stats en temps réel",
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-24 relative matrix-bg">
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/10 mb-6">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-xs font-code text-primary">La solution</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-code text-primary mb-6">
            Le prerender SEO Lovable : hackez votre visibilité
          </h2>
          <p className="text-lg text-muted-foreground font-code max-w-2xl mx-auto">
            4 étapes simples pour rendre votre site Lovable 100% indexable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-lg border border-border bg-card card-hover group"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold font-code text-primary-foreground">
                  {step.step}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:glow-green transition-all">
                <step.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold font-code text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground font-code">
                {step.description}
              </p>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;