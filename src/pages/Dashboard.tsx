import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Globe2, 
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bot,
  Search,
  Trash2,
  Infinity,
  ArrowUpRight,
  Settings,
  Play
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddSiteModal } from "@/components/AddSiteModal";
import { DeleteSiteDialog } from "@/components/DeleteSiteDialog";
import { CrawlsChart } from "@/components/CrawlsChart";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";
import { PrerenderTestModal } from "@/components/PrerenderTestModal";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  last_crawl: string | null;
}

interface BotActivity {
  id: string;
  bot_name: string;
  bot_type: string;
  pages_crawled: number;
  crawled_at: string;
}

interface DailyStats {
  total_pages_rendered: number;
  total_bots: number;
  google_crawls: number;
  ai_crawls: number;
}

interface UserPlan {
  plan_type: string;
  sites_limit: number;
}

interface InvoiceData {
  id: string;
  number: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  createdAt: string;
  paidAt: string | null;
  hostedInvoiceUrl: string | null;
  pdfUrl: string | null;
  description: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  createdAt: string;
  priceId: string;
  productId: string;
}

interface UpcomingInvoiceData {
  amountDue: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
}


const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prerenderTestOpen, setPrerenderTestOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [botActivity, setBotActivity] = useState<BotActivity[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    total_pages_rendered: 0,
    total_bots: 0,
    google_crawls: 0,
    ai_crawls: 0,
  });
  const [hasStatsData, setHasStatsData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan>({ plan_type: "free", sites_limit: 1 });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Subscription & invoices state
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceData | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const fetchSites = useCallback(async (userId?: string) => {
    const targetUserId = userId || currentUserId;
    if (!targetUserId) return;
    
    const { data: sitesData } = await supabase
      .from("sites")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });
    
    if (sitesData) setSites(sitesData);
  }, [currentUserId]);

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!siteToDelete) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("id", siteToDelete.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Site supprimé");
      fetchSites();
    }
    
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setSiteToDelete(null);
  };

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
      
      // Store user id
      setCurrentUserId(session.user.id);
      
      // Fetch sites for current user only
      await fetchSites(session.user.id);

      // Fetch user plan
      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan_type, sites_limit")
        .eq("user_id", session.user.id)
        .single();
      
      if (planData) {
        setUserPlan(planData);
      }

      // Fetch bot activity (last 10)
      const { data: activityData } = await supabase
        .from("bot_activity")
        .select("*")
        .order("crawled_at", { ascending: false })
        .limit(10);
      
      if (activityData) setBotActivity(activityData);

      // Fetch today's stats
      const today = new Date().toISOString().split("T")[0];
      const { data: statsData } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("date", today)
        .maybeSingle();
      
      if (statsData) {
        setStats({
          total_pages_rendered: statsData.total_pages_rendered,
          total_bots: statsData.total_bots,
          google_crawls: statsData.google_crawls,
          ai_crawls: statsData.ai_crawls,
        });
        setHasStatsData(true);
      } else {
        setHasStatsData(false);
      }

      setLoading(false);
      
      // Fetch invoices and subscription info
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.access_token) {
          const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke("get-invoices", {
            headers: {
              Authorization: `Bearer ${currentSession.access_token}`,
            },
          });
          if (!invoiceError && invoiceData) {
            setInvoices(invoiceData.invoices || []);
            setSubscription(invoiceData.subscription || null);
            setUpcomingInvoice(invoiceData.upcomingInvoice || null);
          }
        }
      } catch (e) {
        console.error("Error fetching invoices:", e);
      } finally {
        setInvoicesLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, fetchSites, checkIfBlocked]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-2xl font-bold font-code">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Vue d'ensemble de vos sites et statistiques
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="font-code" 
                size="sm" 
                onClick={() => setPrerenderTestOpen(true)}
              >
                <Play className="w-4 h-4 mr-2" />
                Test Prerender
              </Button>
              <Button className="font-code" size="sm" onClick={() => setAddSiteOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un site
              </Button>
            </div>
          </div>

          <AddSiteModal 
            open={addSiteOpen} 
            onOpenChange={setAddSiteOpen} 
            onSiteAdded={() => fetchSites()}
            currentSitesCount={sites.length}
          />

          <PrerenderTestModal
            open={prerenderTestOpen}
            onOpenChange={setPrerenderTestOpen}
          />

          <DeleteSiteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            siteName={siteToDelete?.name || ""}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />

          {/* Plan Quota Indicator */}
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-accent" />
                <h3 className="font-code font-semibold text-foreground">Quota de sites</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-code px-2 py-1 rounded bg-accent/20 text-accent capitalize">
                  Plan {userPlan.plan_type}
                </span>
                {userPlan.plan_type === "free" ? (
                  <Link to="/upgrade">
                    <Button size="sm" variant="outline" className="font-code text-xs gap-1">
                      Passer au supérieur
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/upgrade">
                    <Button size="sm" variant="outline" className="font-code text-xs gap-1">
                      <Settings className="w-3 h-3" />
                      Gérer mon abonnement
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            {userPlan.sites_limit === -1 ? (
              <div className="flex items-center gap-2">
                <Infinity className="w-5 h-5 text-accent" />
                <span className="text-sm font-code text-muted-foreground">
                  Sites illimités • {sites.length} site(s) créé(s)
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-code text-muted-foreground">
                    {sites.length} / {userPlan.sites_limit} sites utilisés
                  </span>
                  <span className="text-sm font-code text-accent">
                    {userPlan.sites_limit - sites.length} restant(s)
                  </span>
                </div>
                <Progress 
                  value={(sites.length / userPlan.sites_limit) * 100} 
                  className="h-2"
                />
              </>
            )}
          </div>

          {/* Stats Grid */}
          <div className="space-y-6 mb-6">
            {!hasStatsData && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-code text-muted-foreground">
                  Aucune donnée disponible pour aujourd'hui
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-1">Pages rendues</p>
                <p className="text-2xl font-semibold font-code text-foreground">
                  {stats.total_pages_rendered.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-1">Bots aujourd'hui</p>
                <p className="text-2xl font-semibold font-code text-foreground">
                  {stats.total_bots}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-1">Google crawls</p>
                <p className="text-2xl font-semibold font-code text-foreground">
                  {stats.google_crawls}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-1">AI crawls</p>
                <p className="text-2xl font-semibold font-code text-foreground">
                  {stats.ai_crawls}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold font-code text-foreground">Évolution des crawls</h2>
              <span className="text-xs text-muted-foreground font-code">
                7 derniers jours
              </span>
            </div>
            <CrawlsChart botActivity={botActivity} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Sites List */}
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold font-code text-foreground">Mes sites</h2>
                <span className="text-xs text-muted-foreground font-code">
                  {sites.length} sites
                </span>
              </div>

              <div className="space-y-3">
                {sites.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-code text-center py-8">
                    Aucun site ajouté. Cliquez sur "Ajouter un site" pour commencer.
                  </p>
                ) : (
                  sites.map((site) => (
                    <div
                      key={site.id}
                      className="p-3 rounded-lg border border-border bg-background hover:border-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/sites/${site.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-accent" />
                          <span className="font-code text-sm text-foreground">
                            {site.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {site.url && (
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-accent transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteClick(site)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {site.status === "active" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : site.status === "pending" ? (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-xs text-muted-foreground font-code">
                            {site.status === "active"
                              ? "Actif"
                              : site.status === "pending"
                              ? "En attente"
                              : "Erreur"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-code">
                          {site.pages_rendered.toLocaleString()} pages • {site.last_crawl ? new Date(site.last_crawl).toLocaleString("fr-FR") : "Jamais"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bot Activity */}
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold font-code text-foreground">Activité des bots</h2>
                <span className="text-xs text-muted-foreground font-code">
                  Dernières activités
                </span>
              </div>

              <div className="space-y-2">
                {botActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-code text-center py-8">
                    Aucune activité de bot détectée.
                  </p>
                ) : (
                  botActivity.slice(0, 5).map((activity) => (
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
                        <span className="font-code text-sm text-foreground">
                          {activity.bot_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground font-code">
                          {activity.pages_crawled} pages
                        </span>
                        <span className="text-xs text-muted-foreground font-code">
                          {new Date(activity.crawled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {botActivity.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-accent">
                  <Bot className="w-4 h-4" />
                  <span className="text-xs font-code">+23% de crawls vs. hier</span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription & Invoices Section */}
          <SubscriptionCard
            subscription={subscription}
            invoices={invoices}
            upcomingInvoice={upcomingInvoice}
            currentPlan={userPlan.plan_type}
            isLoading={invoicesLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;