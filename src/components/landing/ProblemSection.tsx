import { Terminal } from "@/components/Terminal";
import { AlertTriangle, EyeOff, TrendingDown, Search } from "lucide-react";

export const ProblemSection = () => {
  const problems = [
    {
      icon: EyeOff,
      title: "Contenu invisible",
      description: "Google ne peut pas exécuter votre JavaScript complexe",
      color: "from-destructive/20 to-destructive/5",
    },
    {
      icon: Search,
      title: "Zéro indexation",
      description: "Vos pages n'apparaissent pas dans les résultats de recherche",
      color: "from-orange-500/20 to-orange-500/5",
    },
    {
      icon: TrendingDown,
      title: "Pas de trafic",
      description: "Sans SEO, pas de visiteurs organiques",
      color: "from-yellow-500/20 to-yellow-500/5",
    },
  ];

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 mb-6 opacity-0 animate-fade-in"
          >
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">Le problème</span>
          </div>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Le hack SEO des sites <span className="gradient-text">Lovable</span>
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Sites Lovable en React/Vite : <span className="text-primary font-medium">top pour le dev rapide</span>, 
            <span className="text-destructive font-medium"> nul pour le SEO</span>. Google voit du JS non exécuté 
            → contenu caché → zéro indexation → pas de trafic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-gradient-to-br border border-destructive/20 hover:border-destructive/40 transition-all duration-300 card-hover opacity-0 animate-fade-in-up group"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${problem.color} rounded-2xl opacity-50`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <problem.icon className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div 
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <Terminal title="googlebot-crawler.log" className="max-w-2xl mx-auto">
            <div className="space-y-2 text-sm font-mono">
              <p><span className="text-muted-foreground">[INFO]</span> Crawling https://votre-site.lovable.app</p>
              <p><span className="text-muted-foreground">[INFO]</span> Fetching HTML content...</p>
              <p><span className="text-yellow-500">[WARN]</span> JavaScript detected, attempting render...</p>
              <p><span className="text-destructive">[ERROR]</span> Render timeout exceeded (5000ms)</p>
              <p><span className="text-destructive">[ERROR]</span> No indexable content found</p>
              <p><span className="text-destructive">[RESULT]</span> Page skipped from index ❌</p>
            </div>
          </Terminal>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
