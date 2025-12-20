import { useState } from "react";
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockSites = [
  {
    id: "1",
    name: "mon-portfolio.lovable.app",
    status: "active",
    pagesRendered: 1250,
    lastCrawl: "Il y a 2 heures",
  },
  {
    id: "2",
    name: "saas-landing.lovable.app",
    status: "active",
    pagesRendered: 3420,
    lastCrawl: "Il y a 30 min",
  },
  {
    id: "3",
    name: "blog-tech.lovable.app",
    status: "pending",
    pagesRendered: 0,
    lastCrawl: "En attente",
  },
];

const mockStats = {
  totalPages: 4670,
  botsToday: 156,
  googleCrawls: 89,
  aiCrawls: 67,
};

const mockBotActivity = [
  { bot: "Googlebot", time: "14:32", pages: 12, icon: Search },
  { bot: "ChatGPT", time: "14:28", pages: 5, icon: Bot },
  { bot: "Claude", time: "14:15", pages: 8, icon: Bot },
  { bot: "Bingbot", time: "13:55", pages: 15, icon: Search },
  { bot: "Perplexity", time: "13:42", pages: 3, icon: Bot },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Globe2, label: "Sites", href: "/dashboard/sites" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
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
          <Button className="font-code glow-green" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un site
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">Pages rendues</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-primary">
                {mockStats.totalPages.toLocaleString()}
              </p>
            </div>
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">Bots aujourd'hui</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-secondary">
                {mockStats.botsToday}
              </p>
            </div>
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">Google crawls</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-primary">
                {mockStats.googleCrawls}
              </p>
            </div>
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-2">AI crawls</p>
              <p className="text-2xl lg:text-3xl font-bold font-code text-secondary">
                {mockStats.aiCrawls}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sites List */}
            <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold font-code text-primary">Mes sites</h2>
                <span className="text-xs text-muted-foreground font-code">
                  {mockSites.length} sites
                </span>
              </div>

              <div className="space-y-4">
                {mockSites.map((site) => (
                  <div
                    key={site.id}
                    className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-primary" />
                        <span className="font-code text-sm text-foreground">
                          {site.name}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" />
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
                        {site.pagesRendered.toLocaleString()} pages • {site.lastCrawl}
                      </span>
                    </div>
                  </div>
                ))}
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
                {mockBotActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <activity.icon className="w-4 h-4 text-primary" />
                      <span className="font-code text-sm text-foreground">
                        {activity.bot}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-code">
                        {activity.pages} pages
                      </span>
                      <span className="text-xs text-muted-foreground font-code">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-code">+23% de crawls vs. hier</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;