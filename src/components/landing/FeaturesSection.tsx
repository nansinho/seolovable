import { Zap, Globe2, BarChart3, Shield, Clock, Bot } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "On-demand prerender",
    description: "Smart cache that generates HTML on the fly for each page",
  },
  {
    icon: Globe2,
    title: "Multi-site support",
    description: "Manage all your Lovable projects from one dashboard",
  },
  {
    icon: BarChart3,
    title: "Real-time bot stats",
    description: "Track crawls from Google, Bing, ChatGPT, Claude",
  },
  {
    icon: Shield,
    title: "Free SSL & GDPR safe",
    description: "Auto SSL certificate, no personal data stored",
  },
  {
    icon: Clock,
    title: "5-minute setup",
    description: "Ultra-fast configuration without touching your code",
  },
  {
    icon: Bot,
    title: "AI Integration",
    description: "AI analyzes and optimizes your SEO content",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-card" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4 opacity-0 animate-fade-in"
          >
            Everything you need
          </h2>
          <p 
            className="text-muted-foreground font-mono max-w-xl mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Powerful features for perfect Lovable SEO
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-background border border-border card-hover opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-mono font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
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
