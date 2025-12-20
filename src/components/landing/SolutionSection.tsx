import { Globe, Code, CheckCircle, Rocket } from "lucide-react";

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Sign up",
    description: "Create your account and add your Lovable URL",
  },
  {
    icon: Code,
    step: "02",
    title: "Add CNAME",
    description: "Simple DNS config, copy-paste in 30 seconds",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Auto verification",
    description: "Our system validates your configuration",
  },
  {
    icon: Rocket,
    step: "04",
    title: "You're live",
    description: "Your site is now indexable by all bots",
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-4 opacity-0 animate-fade-in">
            // How it works
          </p>
          <h2 
            className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            4 steps to SEO visibility
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-card border border-border card-hover opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-primary">{step.step}</span>
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-mono font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
