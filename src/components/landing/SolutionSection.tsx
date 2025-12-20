import { Globe, Code, CheckCircle, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Inscrivez-vous",
    description: "Créez votre compte et ajoutez votre URL Lovable en quelques clics",
    color: "from-primary to-orange",
  },
  {
    icon: Code,
    step: "02",
    title: "Ajoutez un CNAME",
    description: "Configuration DNS simple, copier-coller en 30 secondes",
    color: "from-secondary to-turquoise",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Vérification auto",
    description: "Notre système vérifie automatiquement votre configuration",
    color: "from-turquoise to-blue-electric",
  },
  {
    icon: Rocket,
    step: "04",
    title: "C'est live !",
    description: "Votre site est indexé – suivez les stats en temps réel",
    color: "from-primary to-secondary",
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-card" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 opacity-0 animate-fade-in"
          >
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">La solution</span>
          </div>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Le prerender SEO : <span className="gradient-text">hackez votre visibilité</span>
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            4 étapes simples pour rendre votre site Lovable 100% indexable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              {/* Card */}
              <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 card-hover group h-full">
                {/* Step number */}
                <div className={`absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-sm font-display font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 z-20">
                  <ArrowRight className="w-6 h-6 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
