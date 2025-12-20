import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
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
  Copy,
  Play,
  Lock,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";
import { DnsStatusBadge } from "@/components/DnsStatusBadge";
import { PrerenderTestModal } from "@/components/PrerenderTestModal";
import { SimulateCrawlModal } from "@/components/SimulateCrawlModal";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  last_crawl: string | null;
  created_at: string;
  cname_target: string | null;
  txt_record_token: string | null;
  dns_verified: boolean | null;
  dns_verified_at: string | null;
  detected_txt_name?: string | null;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [botActivity, setBotActivity] = useState<BotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTxtName, setCopiedTxtName] = useState(false);
  const [prerenderTestOpen, setPrerenderTestOpen] = useState(false);
  const [simulateCrawlOpen, setSimulateCrawlOpen] = useState(false);

  const { checkIfBlocked } = useBlockedUserCheck();

  // Extract domain from URL
  const getDomain = (url: string | null): string => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "";
    }
  };

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

      // Fetch site with DNS columns including txt_record_token
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("id, name, url, status, pages_rendered, last_crawl, created_at, cname_target, txt_record_token, dns_verified, dns_verified_at")
        .eq("id", id)
        .maybeSingle();

      if (siteError || !siteData) {
        toast.error("Site non trouvé");
        navigate("/dashboard");
        return;
      }

      setSite(siteData as Site);

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

    // Empêcher l'activation si DNS non vérifié
    if (checked && !site.dns_verified) {
      toast.error("Vous devez d'abord vérifier votre configuration DNS avant d'activer le site.");
      return;
    }

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

  const handleVerifyDns = async () => {
    if (!site) return;
    
    setVerifyingDns(true);
    try {
      // Forcer un refresh de la session pour garantir un token valide
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.warn("refreshSession error:", refreshError);
        // Si le refresh échoue, forcer une reconnexion
        toast.error("Session expirée. Veuillez vous reconnecter.");
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      const session = refreshed?.session;
      if (!session?.access_token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-dns", {
        body: { siteId: site.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Gérer les erreurs d'auth retournées par la fonction
      if (data?.error?.includes("Authentication")) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      if (data.verified) {
        setSite({ 
          ...site, 
          dns_verified: true, 
          dns_verified_at: new Date().toISOString(), 
          status: "active",
          detected_txt_name: data.txt_record_name || null,
        });
        toast.success("DNS vérifié avec succès !");
      } else {
        toast.error(data.message || "Le DNS n'est pas encore configuré");
      }
    } catch (error) {
      console.error("DNS verification error:", error);
      toast.error("Erreur lors de la vérification DNS. Réessayez.");
    } finally {
      setVerifyingDns(false);
    }
  };

  const handleCopyToken = async () => {
    if (site?.txt_record_token) {
      await navigator.clipboard.writeText(site.txt_record_token);
      setCopied(true);
      toast.success("Token copié !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyTxtName = async () => {
    if (site?.detected_txt_name) {
      await navigator.clipboard.writeText(site.detected_txt_name);
      setCopiedTxtName(true);
      toast.success("Nom TXT copié !");
      setTimeout(() => setCopiedTxtName(false), 2000);
    }
  };

  const handleRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("id, name, url, status, pages_rendered, last_crawl, created_at, cname_target, txt_record_token, dns_verified, dns_verified_at")
        .eq("id", id)
        .maybeSingle();

      if (siteError || !siteData) {
        toast.error("Erreur lors du rafraîchissement");
        return;
      }

      setSite((prev) => ({ ...siteData, detected_txt_name: prev?.detected_txt_name } as Site));

      const { data: activityData } = await supabase
        .from("bot_activity")
        .select("*")
        .eq("site_id", id)
        .order("crawled_at", { ascending: false })
        .limit(50);

      if (activityData) setBotActivity(activityData);

      toast.success("Données rafraîchies !");
    } catch {
      toast.error("Erreur lors du rafraîchissement");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground font-code">Chargement...</div>
      </div>
    );
  }

  if (!site) return null;

  const totalCrawls = botActivity.length;
  const totalPages = botActivity.reduce((sum, a) => sum + a.pages_crawled, 0);
  const googleCrawls = botActivity.filter((a) => a.bot_type === "search").length;
  const aiCrawls = botActivity.filter((a) => a.bot_type === "ai").length;
  const domain = getDomain(site.url);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <PrerenderTestModal
        open={prerenderTestOpen}
        onOpenChange={setPrerenderTestOpen}
        defaultUrl={site?.url || ""}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-code text-foreground">{site.name}</h1>
                {site.url && (
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {site.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="font-code"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Rafraîchir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-code"
                onClick={() => setPrerenderTestOpen(true)}
              >
                <Play className="w-4 h-4 mr-2" />
                Test Prerender
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-code"
                onClick={() => setSimulateCrawlOpen(true)}
              >
                <Bot className="w-4 h-4 mr-2" />
                Simuler Crawl
              </Button>
            </div>
          </div>
          {/* Site Info Card */}
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-2">
                  {site.status === "active" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : site.status === "pending" ? (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="font-code text-sm text-foreground">
                    {site.status === "active" ? "Actif" : site.status === "pending" ? "En attente" : "Erreur"}
                  </span>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {!site.dns_verified && site.status !== "active" && (
                        <Lock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm text-muted-foreground font-code">Activer</span>
                      <Switch
                        checked={site.status === "active"}
                        onCheckedChange={handleStatusChange}
                        disabled={updatingStatus || (!site.dns_verified && site.status !== "active")}
                      />
                    </div>
                  </TooltipTrigger>
                  {!site.dns_verified && site.status !== "active" && (
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">Configurez et vérifiez votre DNS avant d'activer le site.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-code">
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

          {/* DNS Configuration Card */}
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card mb-6">
            <h3 className="text-base font-semibold font-code text-foreground mb-4">Configuration DNS</h3>
            <DnsStatusBadge
              dnsVerified={site.dns_verified}
              txtRecordToken={site.txt_record_token}
              cnameTarget={site.cname_target}
              status={site.status}
              onVerify={handleVerifyDns}
              isVerifying={verifyingDns}
              domain={domain}
            />
            {site.txt_record_token && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToken}
                  className="font-code text-xs"
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  {copied ? "Copié" : "Copier Token"}
                </Button>
              </div>
            )}
            {site.dns_verified && site.dns_verified_at && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground font-code">
                  Vérifié le {new Date(site.dns_verified_at).toLocaleString("fr-FR")}
                </p>
                {site.detected_txt_name && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-code">
                      Enregistrement détecté : <code className="text-accent">{site.detected_txt_name}</code>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTxtName}
                      className="h-6 px-2"
                    >
                      {copiedTxtName ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Total crawls</p>
              <p className="text-2xl font-semibold font-code text-foreground">{totalCrawls}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Pages crawlées</p>
              <p className="text-2xl font-semibold font-code text-foreground">{totalPages.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Google crawls</p>
              <p className="text-2xl font-semibold font-code text-foreground">{googleCrawls}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">AI crawls</p>
              <p className="text-2xl font-semibold font-code text-foreground">{aiCrawls}</p>
            </div>
          </div>

          {/* Crawl History */}
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold font-code text-foreground">Historique des crawls</h2>
              <span className="text-xs text-muted-foreground font-code">
                {botActivity.length} activités
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                        <Search className="w-4 h-4 text-accent" />
                      ) : (
                        <Bot className="w-4 h-4 text-accent" />
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
        </div>
      </main>

      {/* Modals */}
      <SimulateCrawlModal
        open={simulateCrawlOpen}
        onOpenChange={setSimulateCrawlOpen}
        siteId={site?.id || ""}
        siteName={site?.name || ""}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default SiteDetails;
