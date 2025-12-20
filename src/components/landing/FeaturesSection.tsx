import { Zap, Globe2, BarChart3, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Prerender à la volée",
    description: "Cache intelligent qui génère le HTML à la demande pour chaque page",
  },
  {
    icon: Globe2,
    title: "Support multi-sites",
    description: "Gérez tous vos projets Lovable depuis un seul dashboard",
  },
  {
    icon: BarChart3,
    title: "Stats bots en temps réel",
    description: "Visualisez les crawls de Google, Bing, ChatGPT, Claude et Perplexity",
  },
  {
    icon: Shield,
    title: "SSL gratuit & RGPD safe",
    description: "Certificat SSL automatique, aucune donnée personnelle stockée",
  },
  {
    icon: Sparkles,
    title: "Intégration AI (Premium)",
    description: "Claude analyse et optimise automatiquement votre contenu SEO",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-code text-primary mb-6">
            Fonctionnalités
          </h2>
          <p className="text-lg text-muted-foreground font-code max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour un SEO parfait sur Lovable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-background card-hover group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:glow-green transition-all">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-code text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground font-code">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;