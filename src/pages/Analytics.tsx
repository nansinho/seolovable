import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Bot, Search, Calendar, RefreshCw, BarChart3 } from "lucide-react";
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
import { useI18n } from "@/lib/i18n";

interface PrerenderLog {
  id: number;
  created_at: string;
  cached: boolean;
  url: string;
  domain: string;
  user_agent: string;
  site_id: string | null;
}

interface Site {
  id: string;
  name: string;
}

interface BotInfo {
  name: string;
  type: 'search' | 'ai' | 'other';
  color: string;
}

const BOT_COLORS: Record<string, string> = {
  Googlebot: "hsl(var(--primary))",
  Bingbot: "hsl(210, 100%, 50%)",
  YandexBot: "hsl(0, 80%, 50%)",
  Baidu: "hsl(220, 80%, 50%)",
  DuckDuckBot: "hsl(25, 90%, 55%)",
  Applebot: "hsl(0, 0%, 40%)",
  GPTBot: "hsl(160, 60%, 45%)",
  ClaudeBot: "hsl(30, 90%, 55%)",
  PerplexityBot: "hsl(250, 60%, 55%)",
  Other: "hsl(var(--muted-foreground))",
};

function detectBotFromUserAgent(userAgent: string): BotInfo {
  const ua = userAgent.toLowerCase();
  
  // Search engines
  if (ua.includes('googlebot')) return { name: 'Googlebot', type: 'search', color: BOT_COLORS['Googlebot'] };
  if (ua.includes('bingbot')) return { name: 'Bingbot', type: 'search', color: BOT_COLORS['Bingbot'] };
  if (ua.includes('yandex')) return { name: 'YandexBot', type: 'search', color: BOT_COLORS['YandexBot'] };
  if (ua.includes('baidu')) return { name: 'Baidu', type: 'search', color: BOT_COLORS['Baidu'] };
  if (ua.includes('duckduckbot')) return { name: 'DuckDuckBot', type: 'search', color: BOT_COLORS['DuckDuckBot'] };
  if (ua.includes('applebot')) return { name: 'Applebot', type: 'search', color: BOT_COLORS['Applebot'] };
  
  // AI bots
  if (ua.includes('gptbot') || ua.includes('chatgpt')) return { name: 'GPTBot', type: 'ai', color: BOT_COLORS['GPTBot'] };
  if (ua.includes('claudebot') || ua.includes('anthropic')) return { name: 'ClaudeBot', type: 'ai', color: BOT_COLORS['ClaudeBot'] };
  if (ua.includes('perplexity')) return { name: 'PerplexityBot', type: 'ai', color: BOT_COLORS['PerplexityBot'] };
  
  return { name: 'Other', type: 'other', color: BOT_COLORS['Other'] };
}

export default function Analytics() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("30");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prerenderLogs, setPrerenderLogs] = useState<PrerenderLog[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const PERIODS = useMemo(
    () => [
      { value: "7", label: t("analytics.days7") },
      { value: "14", label: t("analytics.days14") },
      { value: "30", label: t("analytics.days30") },
      { value: "90", label: t("analytics.days90") },
    ],
    [t]
  );

  const fetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const userId = session.user.id;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      // First get user's sites
      const { data: userSites } = await supabase
        .from("sites")
        .select("id, name")
        .eq("user_id", userId);

      if (userSites) {
        setSites(userSites);
        
        // Fetch prerender_logs for user's sites
        const siteIds = userSites.map(s => s.id);
        if (siteIds.length > 0) {
          const { data: logs } = await supabase
            .from("prerender_logs")
            .select("id, created_at, cached, url, domain, user_agent, site_id")
            .in("site_id", siteIds)
            .gte("created_at", daysAgo.toISOString())
            .order("created_at", { ascending: false })
            .limit(1000);
          
          if (logs) setPrerenderLogs(logs);
        } else {
          setPrerenderLogs([]);
        }
      }
    } catch {
      toast.error(t("analytics.loadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Filter logs by selected site
  const filteredLogs = useMemo(() => {
    if (selectedSite === "all") return prerenderLogs;
    return prerenderLogs.filter((log) => log.site_id === selectedSite);
  }, [prerenderLogs, selectedSite]);

  // Process logs with bot detection
  const logsWithBotInfo = useMemo(() => {
    return filteredLogs.map(log => ({
      ...log,
      botInfo: detectBotFromUserAgent(log.user_agent)
    }));
  }, [filteredLogs]);

  // Chart data grouped by date
  const chartDataByDate = useMemo(() => {
    const grouped: Record<string, { date: string; google: number; ai: number; total: number }> = {};

    logsWithBotInfo.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "short",
      });

      if (!grouped[date]) grouped[date] = { date, google: 0, ai: 0, total: 0 };

      if (log.botInfo.type === "search") grouped[date].google += 1;
      else if (log.botInfo.type === "ai") grouped[date].ai += 1;

      grouped[date].total += 1;
    });

    return Object.values(grouped).reverse();
  }, [logsWithBotInfo, dateLocale]);

  // Chart data grouped by bot
  const chartDataByBot = useMemo(() => {
    const grouped: Record<string, { name: string; value: number; color: string; type: string }> = {};

    logsWithBotInfo.forEach((log) => {
      const { name, color, type } = log.botInfo;
      if (!grouped[name]) {
        grouped[name] = { name, value: 0, color, type };
      }
      grouped[name].value += 1;
    });

    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [logsWithBotInfo]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalCrawls = logsWithBotInfo.length;
    const searchCrawls = logsWithBotInfo.filter((l) => l.botInfo.type === "search").length;
    const aiCrawls = logsWithBotInfo.filter((l) => l.botInfo.type === "ai").length;
    const uniqueBots = new Set(logsWithBotInfo.map((l) => l.botInfo.name)).size;

    return { totalCrawls, searchCrawls, aiCrawls, uniqueBots };
  }, [logsWithBotInfo]);

  // Recent activity for table (last 20)
  const recentActivity = useMemo(() => logsWithBotInfo.slice(0, 20), [logsWithBotInfo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <aside className="hidden lg:flex w-64 border-r border-border flex-col p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>
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
      <DashboardSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-2xl font-bold font-code">{t("analytics.title")}</h1>
                <p className="text-muted-foreground text-sm">{t("analytics.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("analytics.allSites")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("analytics.allSites")}</SelectItem>
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
                    <p className="text-xs text-muted-foreground">{t("analytics.totalCrawls")}</p>
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
                    <p className="text-xs text-muted-foreground">{t("analytics.engineCrawls")}</p>
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
                    <p className="text-xs text-muted-foreground">{t("analytics.aiCrawls")}</p>
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
                    <p className="text-xs text-muted-foreground">{t("analytics.uniqueBots")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList>
              <TabsTrigger value="timeline">{t("analytics.timeline")}</TabsTrigger>
              <TabsTrigger value="bots">{t("analytics.byBot")}</TabsTrigger>
              <TabsTrigger value="table">{t("analytics.details")}</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="font-code">{t("analytics.crawlsByDay")}</CardTitle>
                  <CardDescription>{t("analytics.crawlsByDayDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartDataByDate.length === 0 ? (
                    <div className="flex items-center justify-center h-80 text-muted-foreground">{t("analytics.noDataPeriod")}</div>
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
                        <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="google" name={t("analytics.searchEngines")} stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGoogle)" strokeWidth={2} />
                        <Area type="monotone" dataKey="ai" name={t("analytics.aiBots")} stroke="hsl(160, 60%, 45%)" fillOpacity={1} fill="url(#colorAI)" strokeWidth={2} />
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
                    <CardTitle className="font-code">{t("analytics.botDistribution")}</CardTitle>
                    <CardDescription>{t("analytics.pagesCrawledByBot")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartDataByBot.length === 0 ? (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">{t("analytics.noDataPeriod")}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={chartDataByBot} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
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
                    <CardTitle className="font-code">{t("analytics.topBots")}</CardTitle>
                    <CardDescription>{t("analytics.rankingByCrawls")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartDataByBot.length === 0 ? (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">{t("analytics.noDataPeriod")}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartDataByBot.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                          <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" name={t("analytics.pagesCrawled")} radius={[0, 4, 4, 0]}>
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
                  <CardTitle className="font-code">{t("analytics.recentActivity")}</CardTitle>
                  <CardDescription>{t("analytics.last20Crawls")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">{t("analytics.noDataPeriod")}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bot</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Cache</TableHead>
                            <TableHead>{t("analytics.date")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentActivity.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full shrink-0" 
                                    style={{ backgroundColor: log.botInfo.color }}
                                  />
                                  <span className="truncate">{log.botInfo.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={log.botInfo.type === 'search' ? 'default' : log.botInfo.type === 'ai' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {log.botInfo.type === 'search' ? 'Search' : log.botInfo.type === 'ai' ? 'AI' : 'Other'}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate" title={log.url}>
                                {log.url}
                              </TableCell>
                              <TableCell>
                                <Badge variant={log.cached ? 'default' : 'outline'} className="text-xs">
                                  {log.cached ? 'Cached' : 'Fresh'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString(dateLocale, {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
