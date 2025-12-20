import { Zap, Globe2, BarChart3, Shield, Sparkles, Clock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Prerender à la volée",
    description: "Cache intelligent qui génère le HTML à la demande pour chaque page",
    gradient: "from-primary to-orange",
  },
  {
    icon: Globe2,
    title: "Support multi-sites",
    description: "Gérez tous vos projets Lovable depuis un seul dashboard",
    gradient: "from-secondary to-turquoise",
  },
  {
    icon: BarChart3,
    title: "Stats bots en temps réel",
    description: "Visualisez les crawls de Google, Bing, ChatGPT, Claude et Perplexity",
    gradient: "from-turquoise to-blue-electric",
  },
  {
    icon: Shield,
    title: "SSL gratuit & RGPD safe",
    description: "Certificat SSL automatique, aucune donnée personnelle stockée",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Clock,
    title: "Setup en 5 minutes",
    description: "Configuration ultra-rapide sans toucher à votre code source",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Sparkles,
    title: "Intégration AI (Premium)",
    description: "Claude analyse et optimise automatiquement votre contenu SEO",
    gradient: "from-primary to-secondary",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-secondary/10 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 opacity-0 animate-fade-in"
          >
            Tout ce dont vous avez <span className="gradient-text">besoin</span>
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Des fonctionnalités puissantes pour un SEO parfait sur Lovable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-hover group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
