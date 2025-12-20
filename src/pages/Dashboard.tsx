import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  LayoutDashboard, 
  Globe2, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bot,
  Search,
  Menu,
  X,
  Trash2,
  Infinity,
  ArrowUpRight,
  CreditCard
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddSiteModal } from "@/components/AddSiteModal";
import { DeleteSiteDialog } from "@/components/DeleteSiteDialog";
import { CrawlsChart } from "@/components/CrawlsChart";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";

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

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Globe2, label: "Sites", href: "/dashboard/sites" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: CreditCard, label: "Abonnement", href: "/dashboard/billing" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan>({ plan_type: "free", sites_limit: 1 });
  
  // Subscription & invoices state
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceData | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const fetchSites = useCallback(async () => {
    const { data: sitesData } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (sitesData) setSites(sitesData);
  }, []);

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
      
      // Fetch sites
      await fetchSites();

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
        .single();
      
      if (statsData) {
        setStats({
          total_pages_rendered: statsData.total_pages_rendered,
          total_bots: statsData.total_bots,
          google_crawls: statsData.google_crawls,
          ai_crawls: statsData.ai_crawls,
        });
      }

      setLoading(false);
      
      // Fetch invoices and subscription info
      try {
        const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke("get-invoices");
        if (!invoiceError && invoiceData) {
          setInvoices(invoiceData.invoices || []);
          setSubscription(invoiceData.subscription || null);
          setUpcomingInvoice(invoiceData.upcomingInvoice || null);
        }
      } catch (e) {
        console.error("Error fetching invoices:", e);
      } finally {
        setInvoicesLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, fetchSites, checkIfBlocked]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
      return;
    }
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <span className="font-code font-bold text-primary">
                SEO Lovable
              </span>
            </Link>
            <button 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors font-code text-sm"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-code text-sm text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-code text-primary">Dashboard</h1>
          </div>
          <Button className="font-code glow-green" size="sm" onClick={() => setAddSiteOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un site
          </Button>
        </header>

        <AddSiteModal 
          open={addSiteOpen} 
          onOpenChange={setAddSiteOpen} 
          onSiteAdded={fetchSites}
          currentSitesCount={sites.length}
        />

        <DeleteSiteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          siteName={siteToDelete?.name || ""}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-auto">
          {/* Plan Quota Indicator */}
          <div className="p-4 lg:p-6 rounded-lg border border-primary/30 bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-primary" />
                <h3 className="font-code font-bold text-foreground">Quota de sites</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-code px-2 py-1 rounded bg-primary/20 text-primary">
                  Plan {userPlan.plan_type}
                </span>
                {userPlan.plan_type === "free" ? (
                  <Link to="/upgrade">
                    <Button size="sm" variant="outline" className="font-code text-xs gap-1 glow-green">
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
                <Infinity className="w-5 h-5 text-primary" />
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
                  <span className="text-sm font-code text-primary">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">Pages rendues</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-primary">
                {stats.total_pages_rendered.toLocaleString()}
              </p>
            </div>
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">Bots aujourd'hui</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-secondary">
                {stats.total_bots}
              </p>
            </div>
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">Google crawls</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-primary">
                {stats.google_crawls}
              </p>
            </div>
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">AI crawls</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-secondary">
                {stats.ai_crawls}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-code text-primary">Évolution des crawls</h2>
              <span className="text-xs text-muted-foreground font-code">
                7 derniers jours
              </span>
            </div>
            <CrawlsChart botActivity={botActivity} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sites List */}
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold font-code text-primary">Mes sites</h2>
                <span className="text-xs text-muted-foreground font-code">
                  {sites.length} sites
                </span>
              </div>

              <div className="space-y-4">
                {sites.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-code text-center py-8">
                    Aucun site ajouté. Cliquez sur "Ajouter un site" pour commencer.
                  </p>
                ) : (
                  sites.map((site) => (
                    <div
                      key={site.id}
                      className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/sites/${site.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-primary" />
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
                              className="text-muted-foreground hover:text-primary transition-colors"
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
                            <CheckCircle className="w-4 h-4 text-primary" />
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
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card terminal-window">
              <div className="terminal-header !bg-transparent !p-0 mb-4">
                <div className="flex items-center gap-2">
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                  <span className="ml-2 text-xs text-muted-foreground font-code">
                    bot-activity.log
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {botActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-code text-center py-8">
                    Aucune activité de bot détectée.
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

              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-code">+23% de crawls vs. hier</span>
              </div>
            </div>
          </div>

          {/* Subscription & Invoices Section */}
          <div className="mt-8">
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
    </div>
  );
};

export default Dashboard;