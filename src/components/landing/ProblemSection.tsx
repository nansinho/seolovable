import { Terminal } from "@/components/Terminal";
import { AlertTriangle, EyeOff, TrendingDown, Search } from "lucide-react";

export const ProblemSection = () => {
  const problems = [
    {
      icon: EyeOff,
      title: "Contenu invisible",
      description: "Google ne peut pas exécuter votre JavaScript complexe",
    },
    {
      icon: Search,
      title: "Zéro indexation",
      description: "Vos pages n'apparaissent pas dans les résultats de recherche",
    },
    {
      icon: TrendingDown,
      title: "Pas de trafic",
      description: "Sans SEO, pas de visiteurs organiques",
    },
  ];

  return (
    <section className="py-24 bg-card relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/50 bg-destructive/10 mb-6">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-code text-destructive">Le problème</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-code text-primary mb-6">
            Le hack SEO des sites Lovable
          </h2>
          <p className="text-lg text-muted-foreground font-code max-w-3xl mx-auto">
            Sites Lovable en React/Vite : <span className="text-primary">top pour le dev rapide</span>, 
            <span className="text-destructive"> nul pour le SEO</span>. Google voit du JS non exécuté 
            → contenu caché → zéro indexation → pas de trafic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-destructive/30 bg-destructive/5 card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <problem.icon className="w-10 h-10 text-destructive mb-4" />
              <h3 className="text-lg font-bold font-code text-destructive mb-2">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground font-code">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        <Terminal title="googlebot-crawler.log" className="max-w-2xl mx-auto">
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">[INFO]</span> Crawling https://votre-site.lovable.app</p>
            <p><span className="text-muted-foreground">[INFO]</span> Fetching HTML content...</p>
            <p><span className="text-yellow-500">[WARN]</span> JavaScript detected, attempting render...</p>
            <p><span className="text-destructive">[ERROR]</span> Render timeout exceeded (5000ms)</p>
            <p><span className="text-destructive">[ERROR]</span> No indexable content found</p>
            <p><span className="text-destructive">[RESULT]</span> Page skipped from index ❌</p>
          </div>
        </Terminal>
      </div>
    </section>
  );
};

export default ProblemSection;