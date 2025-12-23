import { useState, useEffect, useCallback, useMemo } from "react";
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
import { PrerenderTestModal } from "@/components/PrerenderTestModal";
import { PendingSeoTestModal } from "@/components/PendingSeoTestModal";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { DashboardContentSkeleton } from "@/components/DashboardSkeleton";
import { useI18n } from "@/lib/i18n";

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  last_crawl: string | null;
  dns_verified: boolean | null;
}

interface PrerenderLog {
  id: number;
  created_at: string;
  cached: boolean;
  url: string;
  domain: string;
  user_agent: string;
  site_id: string;
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
  const { userId, userEmail, loading: authLoading, isAuthenticated } = useAuth();
  const { t, lang } = useI18n();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prerenderTestOpen, setPrerenderTestOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [prerenderLogs, setPrerenderLogs] = useState<PrerenderLog[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    total_pages_rendered: 0,
    total_bots: 0,
    google_crawls: 0,
    ai_crawls: 0,
  });
  const [hasStatsData, setHasStatsData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan>({ plan_type: "free", sites_limit: 1 });
  
  // Pending SEO test from landing page
  const [pendingSeoTestOpen, setPendingSeoTestOpen] = useState(false);
  const [pendingSeoTestUrl, setPendingSeoTestUrl] = useState<string | null>(null);
  
  // Subscription & invoices state
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceData | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const fetchSites = useCallback(async () => {
    if (!userId) return;
    
    const { data: sitesData } = await supabase
      .from("sites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (sitesData) setSites(sitesData);
  }, [userId]);

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
      toast.error(t("toast.deleteError"));
    } else {
      toast.success(t("toast.deleteSuccess"));
      fetchSites();
    }
    
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setSiteToDelete(null);
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !userId) return;

    const fetchData = async () => {
      // Check for pending SEO test from landing page
      const pendingUrl = sessionStorage.getItem("pending_seo_test_url");
      if (pendingUrl) {
        sessionStorage.removeItem("pending_seo_test_url");
        setPendingSeoTestUrl(pendingUrl);
        setPendingSeoTestOpen(true);
      }
      
      // Fetch sites first
      const sitesResult = await supabase
        .from("sites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const userSites = sitesResult.data || [];
      const siteIds = userSites.map(s => s.id);
      
      // Fetch rest in parallel
      const [planResult, activityResult] = await Promise.all([
        supabase
          .from("user_plans")
          .select("plan_type, sites_limit")
          .eq("user_id", userId)
          .maybeSingle(),
        // Fetch prerender_logs for user's sites only (plus de logs pour les stats)
        siteIds.length > 0 
          ? supabase
              .from("prerender_logs")
              .select("id, created_at, cached, url, domain, user_agent, site_id")
              .in("site_id", siteIds)
              .order("created_at", { ascending: false })
              .limit(100)
          : Promise.resolve({ data: [] }),
      ]);

      if (userSites) setSites(userSites);
      if (planResult.data) setUserPlan(planResult.data);
      
      const logs = activityResult.data || [];
      if (logs.length > 0) {
        setPrerenderLogs(logs);
        
        // Calculer les stats en temps réel à partir des prerender_logs
        const today = new Date().toISOString().split("T")[0];
        const todayLogs = logs.filter(l => l.created_at.startsWith(today));
        
        // Total pages rendues aujourd'hui
        const totalRendered = todayLogs.length;
        
        // Compter les bots uniques (par user_agent simplifié)
        const botUserAgents = new Set(todayLogs.map(l => {
          const ua = l.user_agent.toLowerCase();
          if (ua.includes('googlebot')) return 'google';
          if (ua.includes('gptbot') || ua.includes('chatgpt') || ua.includes('claudebot') || ua.includes('anthropic')) return 'ai';
          if (ua.includes('bingbot') || ua.includes('yandex') || ua.includes('baidu')) return 'search';
          return 'other';
        }));
        
        // Compter Google crawls
        const googleCrawls = todayLogs.filter(l => l.user_agent.toLowerCase().includes('googlebot')).length;
        
        // Compter AI crawls
        const aiCrawls = todayLogs.filter(l => {
          const ua = l.user_agent.toLowerCase();
          return ua.includes('gptbot') || ua.includes('chatgpt') || ua.includes('claudebot') || ua.includes('anthropic') || ua.includes('perplexity');
        }).length;
        
        setStats({
          total_pages_rendered: totalRendered,
          total_bots: botUserAgents.size,
          google_crawls: googleCrawls,
          ai_crawls: aiCrawls,
        });
        setHasStatsData(totalRendered > 0);
      } else {
        setPrerenderLogs([]);
        setHasStatsData(false);
      }

      setLoading(false);
      
      // Fetch invoices separately (edge function call)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke("get-invoices", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
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

    fetchData();
  }, [authLoading, isAuthenticated, userId]);

  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

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
                <h1 className="text-2xl font-bold font-code">{t("dashboard.title")}</h1>
                <p className="text-muted-foreground text-sm">
                  {t("dashboard.subtitle")}
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
                {t("dashboard.testPrerender")}
              </Button>
              <Button className="font-code" size="sm" onClick={() => setAddSiteOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.addSite")}
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

          {/* Pending SEO Test Modal from landing page */}
          {pendingSeoTestUrl && userEmail && (
            <PendingSeoTestModal
              open={pendingSeoTestOpen}
              onOpenChange={setPendingSeoTestOpen}
              url={pendingSeoTestUrl}
              userEmail={userEmail}
              onComplete={() => {
                setPendingSeoTestUrl(null);
                setAddSiteOpen(true); // Open add site modal after
              }}
            />
          )}

          <DeleteSiteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            siteName={siteToDelete?.name || ""}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />

          {/* Loading Skeleton */}
          {loading ? (
            <DashboardContentSkeleton />
          ) : (
            <>
              {/* Plan Quota Indicator */}
              <div className="p-4 lg:p-6 rounded-lg border border-border bg-card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-accent" />
                <h3 className="font-code font-semibold text-foreground">{t("dashboard.siteQuota")}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-code px-2 py-1 rounded bg-accent/20 text-accent capitalize">
                  {t("dashboard.plan")} {userPlan.plan_type}
                </span>
                {userPlan.plan_type === "free" ? (
                  <Link to="/upgrade">
                    <Button size="sm" variant="outline" className="font-code text-xs gap-1">
                      {t("dashboard.upgrade")}
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/upgrade">
                    <Button size="sm" variant="outline" className="font-code text-xs gap-1">
                      <Settings className="w-3 h-3" />
                      {t("dashboard.manageSub")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            {userPlan.sites_limit === -1 ? (
              <div className="flex items-center gap-2">
                <Infinity className="w-5 h-5 text-accent" />
                <span className="text-sm font-code text-muted-foreground">
                  {t("dashboard.unlimitedSites")} • {sites.length} {t("dashboard.sitesCreated")}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-code text-muted-foreground">
                    {sites.length} / {userPlan.sites_limit} {t("dashboard.sitesUsed")}
                  </span>
                  <span className="text-sm font-code text-accent">
                    {userPlan.sites_limit - sites.length} {t("dashboard.remaining")}
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
                  {t("dashboard.noDataToday")}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-2">{t("dashboard.pagesRendered")}</p>
                <p className="text-2xl font-bold font-code text-foreground">
                  {stats.total_pages_rendered.toLocaleString()}
                </p>
              </div>
              <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-2">{t("dashboard.botsToday")}</p>
                <p className="text-2xl font-bold font-code text-foreground">
                  {stats.total_bots}
                </p>
              </div>
              <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-2">{t("dashboard.googleCrawls")}</p>
                <p className="text-2xl font-bold font-code text-foreground">
                  {stats.google_crawls}
                </p>
              </div>
              <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground font-code mb-2">{t("dashboard.aiCrawls")}</p>
                <p className="text-2xl font-bold font-code text-foreground">
                  {stats.ai_crawls}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="p-4 lg:p-6 rounded-xl border border-border bg-card mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold font-code text-foreground">{t("dashboard.crawlsEvolution")}</h2>
              <span className="text-xs text-muted-foreground font-code">
                {t("dashboard.last7days")}
              </span>
            </div>
            <CrawlsChart prerenderLogs={prerenderLogs} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Sites List */}
            <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold font-code text-foreground">{t("dashboard.mySites")}</h2>
                <span className="text-xs text-muted-foreground font-code">
                  {sites.length} {t("dashboard.sites")}
                </span>
              </div>

              <div className="space-y-3">
                {sites.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-code text-center py-8">
                    {t("dashboard.noSites")}
                  </p>
                ) : (
                  sites.map((site) => (
                    <div
                      key={site.id}
                      className={`p-3 rounded-lg border bg-background transition-colors cursor-pointer ${
                        site.dns_verified 
                          ? "border-border hover:border-accent/50" 
                          : "border-yellow-500/30 bg-yellow-500/5"
                      }`}
                      onClick={() => navigate(`/dashboard/sites/${site.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe2 className={`w-4 h-4 ${site.dns_verified ? "text-accent" : "text-yellow-500"}`} />
                          <span className="font-code text-sm text-foreground">
                            {site.name}
                          </span>
                          {!site.dns_verified && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 font-code">
                              DNS
                            </span>
                          )}
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
                          {site.status === "active" && site.dns_verified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : !site.dns_verified ? (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          ) : site.status === "pending" ? (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-xs text-muted-foreground font-code">
                            {!site.dns_verified
                              ? t("dashboard.dnsRequired")
                              : site.status === "active"
                              ? t("dashboard.active")
                              : site.status === "pending"
                              ? t("dashboard.pending")
                              : t("dashboard.error")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-code">
                          {site.pages_rendered.toLocaleString()} pages • {site.last_crawl ? new Date(site.last_crawl).toLocaleString(dateLocale) : t("dashboard.never")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prerender Activity */}
            <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold font-code text-foreground">{t("dashboard.recentActivity")}</h2>
                <span className="text-xs text-muted-foreground font-code">
                  {prerenderLogs.length} {t("dashboard.renders") || "renders"}
                </span>
              </div>

              <div className="space-y-2">
                {prerenderLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-code text-center py-8">
                    {t("dashboard.noRecentActivity")}
                  </p>
                ) : (
                  prerenderLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.cached ? "bg-green-500" : "bg-orange-500"}`} />
                        <span className="font-code text-sm text-foreground truncate">
                          {log.domain}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-muted-foreground font-code">
                          {log.cached ? t("dashboard.chart.cached") : t("dashboard.chart.fresh")}
                        </span>
                        <span className="text-xs text-muted-foreground font-code">
                          {new Date(log.created_at).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {prerenderLogs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-accent">
                  <Bot className="w-4 h-4" />
                  <span className="text-xs font-code">
                    {prerenderLogs.filter(l => l.cached).length} cached / {prerenderLogs.length} total
                  </span>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;