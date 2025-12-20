import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  TrendingUp,
  Bot,
  Search,
  Calendar,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";

interface BotActivity {
  id: string;
  bot_name: string;
  bot_type: string;
  pages_crawled: number;
  crawled_at: string;
  site_id: string | null;
}

interface Site {
  id: string;
  name: string;
}

const PERIODS = [
  { value: "7", label: "7 derniers jours" },
  { value: "14", label: "14 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
];

const BOT_COLORS: Record<string, string> = {
  Googlebot: "hsl(var(--primary))",
  Bingbot: "hsl(210, 100%, 50%)",
  YandexBot: "hsl(0, 80%, 50%)",
  "GPTBot": "hsl(160, 60%, 45%)",
  "ClaudeBot": "hsl(30, 90%, 55%)",
  "ChatGPT-User": "hsl(160, 60%, 55%)",
  "Anthropic": "hsl(25, 85%, 55%)",
  "Other": "hsl(var(--muted-foreground))",
};

export default function Analytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("30");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [botActivity, setBotActivity] = useState<BotActivity[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      const [activityResult, sitesResult] = await Promise.all([
        supabase
          .from("bot_activity")
          .select("*")
          .gte("crawled_at", daysAgo.toISOString())
          .order("crawled_at", { ascending: false }),
        supabase.from("sites").select("id, name"),
      ]);

      if (activityResult.data) setBotActivity(activityResult.data);
      if (sitesResult.data) setSites(sitesResult.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const filteredActivity = useMemo(() => {
    if (selectedSite === "all") return botActivity;
    return botActivity.filter((a) => a.site_id === selectedSite);
  }, [botActivity, selectedSite]);

  // Chart data by date
  const chartDataByDate = useMemo(() => {
    const grouped: Record<string, { date: string; google: number; ai: number; total: number }> = {};

    filteredActivity.forEach((activity) => {
      const date = new Date(activity.crawled_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });

      if (!grouped[date]) {
        grouped[date] = { date, google: 0, ai: 0, total: 0 };
      }

      if (activity.bot_type === "search") {
        grouped[date].google += activity.pages_crawled;
      } else {
        grouped[date].ai += activity.pages_crawled;
      }
      grouped[date].total += activity.pages_crawled;
    });

    return Object.values(grouped).reverse();
  }, [filteredActivity]);

  // Chart data by bot
  const chartDataByBot = useMemo(() => {
    const grouped: Record<string, number> = {};

    filteredActivity.forEach((activity) => {
      const name = activity.bot_name;
      grouped[name] = (grouped[name] || 0) + activity.pages_crawled;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        color: BOT_COLORS[name] || BOT_COLORS["Other"],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredActivity]);

  // Stats summary
  const stats = useMemo(() => {
    const totalCrawls = filteredActivity.reduce((acc, a) => acc + a.pages_crawled, 0);
    const searchCrawls = filteredActivity
      .filter((a) => a.bot_type === "search")
      .reduce((acc, a) => acc + a.pages_crawled, 0);
    const aiCrawls = filteredActivity
      .filter((a) => a.bot_type === "ai")
      .reduce((acc, a) => acc + a.pages_crawled, 0);
    const uniqueBots = new Set(filteredActivity.map((a) => a.bot_name)).size;

    return { totalCrawls, searchCrawls, aiCrawls, uniqueBots };
  }, [filteredActivity]);

  // Recent activity table
  const recentActivity = useMemo(() => {
    return filteredActivity.slice(0, 20);
  }, [filteredActivity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:flex w-64 border-r border-border flex-col p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>
        {/* Main content skeleton */}
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </main>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold font-code">Analytics</h1>
                <p className="text-muted-foreground text-sm">
                  Statistiques détaillées de crawl par bot et période
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-code">{stats.totalCrawls}</p>
                    <p className="text-xs text-muted-foreground">Total crawls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Search className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-code">{stats.searchCrawls}</p>
                    <p className="text-xs text-muted-foreground">Crawls moteurs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Bot className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-code">{stats.aiCrawls}</p>
                    <p className="text-xs text-muted-foreground">Crawls IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-code">{stats.uniqueBots}</p>
                    <p className="text-xs text-muted-foreground">Bots uniques</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList>
              <TabsTrigger value="timeline">Chronologie</TabsTrigger>
              <TabsTrigger value="bots">Par Bot</TabsTrigger>
              <TabsTrigger value="table">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="font-code">Crawls par jour</CardTitle>
                  <CardDescription>
                    Évolution des crawls Google vs IA sur la période sélectionnée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartDataByDate.length === 0 ? (
                    <div className="flex items-center justify-center h-80 text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={chartDataByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="google"
                          name="Moteurs de recherche"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorGoogle)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="ai"
                          name="Bots IA"
                          stroke="hsl(160, 60%, 45%)"
                          fillOpacity={1}
                          fill="url(#colorAI)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bots">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-code">Répartition par bot</CardTitle>
                    <CardDescription>Pages crawlées par chaque bot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartDataByBot.length === 0 ? (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">
                        Aucune donnée pour cette période
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartDataByBot}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartDataByBot.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-code">Top bots</CardTitle>
                    <CardDescription>Classement par nombre de crawls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartDataByBot.length === 0 ? (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">
                        Aucune donnée pour cette période
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartDataByBot.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            width={100}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" name="Pages crawlées" radius={[0, 4, 4, 0]}>
                            {chartDataByBot.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle className="font-code">Activité récente</CardTitle>
                  <CardDescription>Les 20 derniers crawls détectés</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      Aucune activité récente
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bot</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Pages</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentActivity.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-code font-medium">{activity.bot_name}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "px-2 py-1 rounded text-xs font-medium",
                                  activity.bot_type === "search"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-emerald-500/10 text-emerald-600"
                                )}
                              >
                                {activity.bot_type === "search" ? "Moteur" : "IA"}
                              </span>
                            </TableCell>
                            <TableCell className="font-code">{activity.pages_crawled}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(activity.crawled_at).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
