import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Terminal,
  ArrowLeft,
  Globe2,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bot,
  Search,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  last_crawl: string | null;
  created_at: string;
}

interface BotActivity {
  id: string;
  bot_name: string;
  bot_type: string;
  pages_crawled: number;
  crawled_at: string;
}

const SiteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [botActivity, setBotActivity] = useState<BotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { checkIfBlocked } = useBlockedUserCheck();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is blocked
      const isBlocked = await checkIfBlocked(session.user.id);
      if (isBlocked) return;

      if (!id) {
        navigate("/dashboard");
        return;
      }

      // Fetch site
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (siteError || !siteData) {
        toast.error("Site non trouvé");
        navigate("/dashboard");
        return;
      }

      setSite(siteData);

      // Fetch bot activity for this site
      const { data: activityData } = await supabase
        .from("bot_activity")
        .select("*")
        .eq("site_id", id)
        .order("crawled_at", { ascending: false })
        .limit(50);

      if (activityData) setBotActivity(activityData);

      setLoading(false);
    };

    checkAuthAndFetchData();
  }, [id, navigate, checkIfBlocked]);

  const handleStatusChange = async (checked: boolean) => {
    if (!site) return;

    setUpdatingStatus(true);
    const newStatus = checked ? "active" : "pending";

    const { error } = await supabase
      .from("sites")
      .update({ status: newStatus })
      .eq("id", site.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } else {
      setSite({ ...site, status: newStatus });
      toast.success(`Site ${checked ? "activé" : "désactivé"}`);
    }

    setUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-code">Chargement...</div>
      </div>
    );
  }

  if (!site) return null;

  const totalCrawls = botActivity.length;
  const totalPages = botActivity.reduce((sum, a) => sum + a.pages_crawled, 0);
  const googleCrawls = botActivity.filter((a) => a.bot_type === "search").length;
  const aiCrawls = botActivity.filter((a) => a.bot_type === "ai").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-code font-bold text-primary">SEO Lovable</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Site Header */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-code text-primary">{site.name}</h1>
                {site.url && (
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {site.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {site.status === "active" ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : site.status === "pending" ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-code text-sm">
                  {site.status === "active" ? "Actif" : site.status === "pending" ? "En attente" : "Erreur"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-code">Activer</span>
                <Switch
                  checked={site.status === "active"}
                  onCheckedChange={handleStatusChange}
                  disabled={updatingStatus}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground font-code">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Créé le {new Date(site.created_at).toLocaleDateString("fr-FR")}
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {site.pages_rendered.toLocaleString()} pages rendues
            </div>
            {site.last_crawl && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Dernier crawl: {new Date(site.last_crawl).toLocaleString("fr-FR")}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Total crawls</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-primary">{totalCrawls}</p>
          </div>
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Pages crawlées</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-secondary">{totalPages.toLocaleString()}</p>
          </div>
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Google crawls</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-primary">{googleCrawls}</p>
          </div>
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">AI crawls</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-secondary">{aiCrawls}</p>
          </div>
        </div>

        {/* Crawl History */}
        <div className="p-4 lg:p-6 rounded-lg border border-border bg-card terminal-window">
          <div className="terminal-header !bg-transparent !p-0 mb-4">
            <div className="flex items-center gap-2">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
              <span className="ml-2 text-xs text-muted-foreground font-code">
                crawl-history.log
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {botActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground font-code text-center py-8">
                Aucune activité de bot détectée pour ce site.
              </p>
            ) : (
              botActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {activity.bot_type === "search" ? (
                      <Search className="w-4 h-4 text-primary" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                    <span className="font-code text-sm text-foreground">{activity.bot_name}</span>
                    <span className="text-xs text-muted-foreground font-code px-2 py-0.5 rounded bg-muted">
                      {activity.bot_type === "search" ? "Moteur de recherche" : "IA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-code">
                      {activity.pages_crawled} pages
                    </span>
                    <span className="text-xs text-muted-foreground font-code">
                      {new Date(activity.crawled_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SiteDetails;
