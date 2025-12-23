import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Database, Zap, Clock, Bot, Search, MessageSquare, Share2, HelpCircle, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PrerenderLog {
  id: number;
  created_at: string;
  cached: boolean;
  url: string;
  user_agent: string;
  domain: string;
  bot_name: string | null;
  bot_type: string | null;
  render_time_ms: number | null;
  source: string | null;
}

interface SitePrerenderStatsProps {
  siteId: string;
}

// Bot type icons and colors
const BOT_CONFIG: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  search: { icon: Search, color: "text-blue-500", label: "Search" },
  ai: { icon: MessageSquare, color: "text-purple-500", label: "AI" },
  social: { icon: Share2, color: "text-pink-500", label: "Social" },
  other: { icon: HelpCircle, color: "text-gray-500", label: "Other" },
};

function BotBadge({ botName, botType, source }: { botName: string | null; botType: string | null; source: string | null }) {
  // Show source badge for simulations
  if (source === 'simulate') {
    const config = botType ? BOT_CONFIG[botType] || BOT_CONFIG.other : BOT_CONFIG.other;
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className={`text-xs gap-1 font-code ${config.color} border-current/30 bg-current/10`}>
          <Icon className="w-3 h-3" />
          {botName || 'Test'}
        </Badge>
        <Badge variant="secondary" className="text-xs font-code bg-orange-500/10 text-orange-500 border-orange-500/30">
          Simulation
        </Badge>
      </div>
    );
  }

  if (!botName || !botType) {
    return (
      <Badge variant="outline" className="text-xs gap-1 font-code bg-muted/50">
        <User className="w-3 h-3" />
        Test manuel
      </Badge>
    );
  }

  const config = BOT_CONFIG[botType] || BOT_CONFIG.other;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`text-xs gap-1 font-code ${config.color} border-current/30 bg-current/10`}>
      <Icon className="w-3 h-3" />
      {botName}
    </Badge>
  );
}

export function SitePrerenderStats({ siteId }: SitePrerenderStatsProps) {
  const [logs, setLogs] = useState<PrerenderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { t, lang } = useI18n();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("prerender_logs")
        .select("id, created_at, cached, url, user_agent, domain, bot_name, bot_type, render_time_ms, source")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching prerender logs:", error);
      } else {
        setLogs(data || []);
      }
      setIsLoading(false);
    };

    fetchLogs();

    // Realtime subscription
    const channel = supabase
      .channel(`prerender_logs_${siteId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "prerender_logs",
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as PrerenderLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId]);

  const filteredLogs = useMemo(() => {
    if (filter === "all") return logs;
    if (filter === "bots") return logs.filter((l) => l.bot_type && l.source !== 'simulate');
    if (filter === "simulate") return logs.filter((l) => l.source === 'simulate');
    if (filter === "manual") return logs.filter((l) => !l.bot_type && l.source !== 'simulate');
    return logs.filter((l) => l.bot_type === filter);
  }, [logs, filter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const cached = logs.filter((l) => l.cached).length;
    const fresh = total - cached;
    const cacheRate = total > 0 ? Math.round((cached / total) * 100) : 0;
    
    // Bot stats - exclude simulations for real bot counts
    const realBots = logs.filter((l) => l.bot_type && l.source !== 'simulate').length;
    const simulations = logs.filter((l) => l.source === 'simulate').length;
    const manualTests = logs.filter((l) => !l.bot_type && l.source !== 'simulate').length;
    const searchBots = logs.filter((l) => l.bot_type === "search" && l.source !== 'simulate').length;
    const aiBots = logs.filter((l) => l.bot_type === "ai" && l.source !== 'simulate').length;
    const socialBots = logs.filter((l) => l.bot_type === "social" && l.source !== 'simulate').length;
    
    return { total, cached, fresh, cacheRate, realBots, simulations, manualTests, searchBots, aiBots, socialBots };
  }, [logs]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { [key: string]: { total: number; cached: number; fresh: number; search: number; ai: number; social: number } } = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = { total: 0, cached: 0, fresh: 0, search: 0, ai: 0, social: 0 };
    }

    logs.forEach((log) => {
      const d = new Date(log.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (months[key]) {
        months[key].total++;
        if (log.cached) months[key].cached++;
        else months[key].fresh++;
        if (log.bot_type === "search") months[key].search++;
        if (log.bot_type === "ai") months[key].ai++;
        if (log.bot_type === "social") months[key].social++;
      }
    });

    return Object.entries(months).map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString(dateLocale, { month: "short" }),
      ...data,
    }));
  }, [logs, dateLocale]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 rounded-xl border border-border bg-card space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-accent" />
        <h3 className="text-base font-semibold font-code text-foreground">
          {t("prerenderStats.title")}
        </h3>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
          <Database className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-xl font-bold font-code text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground font-code">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
          <Search className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold font-code text-blue-500">{stats.searchBots}</p>
          <p className="text-xs text-muted-foreground font-code">Search Bots</p>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
          <MessageSquare className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <p className="text-xl font-bold font-code text-purple-500">{stats.aiBots}</p>
          <p className="text-xs text-muted-foreground font-code">AI Bots</p>
        </div>
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
          <Bot className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold font-code text-orange-500">{stats.simulations}</p>
          <p className="text-xs text-muted-foreground font-code">Simulations</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/30 text-center">
          <User className="w-4 h-4 text-gray-500 mx-auto mb-1" />
          <p className="text-xl font-bold font-code text-gray-500">{stats.manualTests}</p>
          <p className="text-xs text-muted-foreground font-code">Tests manuels</p>
        </div>
      </div>

      {/* Cache Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-code text-muted-foreground">
            {t("prerenderStats.cacheRate")}
          </span>
          <span className="text-sm font-bold font-code text-accent">{stats.cacheRate}%</span>
        </div>
        <Progress value={stats.cacheRate} className="h-2" />
      </div>

      {/* Tabs for charts */}
      <Tabs defaultValue="cache" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cache" className="font-code text-xs">Cache Hit/Miss</TabsTrigger>
          <TabsTrigger value="bots" className="font-code text-xs">Par type de bot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cache">
          {monthlyData.some((m) => m.total > 0) && (
            <div className="pt-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="cached" fill="hsl(142, 76%, 36%)" name="Cached" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fresh" fill="hsl(25, 95%, 53%)" name="Fresh" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bots">
          {monthlyData.some((m) => m.total > 0) && (
            <div className="pt-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="search" fill="hsl(217, 91%, 60%)" name="Search" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ai" fill="hsl(270, 91%, 65%)" name="AI" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="social" fill="hsl(330, 81%, 60%)" name="Social" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Logs with filter */}
      {logs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-code">
              {t("prerenderStats.recentLogs")} ({filteredLogs.length})
            </p>
            <div className="flex gap-1 flex-wrap">
              {["all", "bots", "simulate", "search", "ai", "manual"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 text-xs font-code rounded-md transition-colors ${
                    filter === f
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "bots" ? "Bots réels" : f === "simulate" ? "Simulations" : f === "manual" ? "Manuels" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {filteredLogs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-1 py-2 px-3 rounded-lg bg-muted/30 text-xs font-code border border-border/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.cached ? "bg-green-500" : "bg-orange-500"
                      }`}
                      title={log.cached ? "Cached" : "Fresh render"}
                    />
                    <BotBadge botName={log.bot_name} botType={log.bot_type} source={log.source} />
                  </div>
                  <span className="text-muted-foreground/70 flex-shrink-0">
                    {new Date(log.created_at).toLocaleString(dateLocale, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-muted-foreground truncate pl-4" title={log.url}>
                  {log.url}
                </div>
                {log.render_time_ms && (
                  <div className="text-muted-foreground/50 pl-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.render_time_ms}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <p className="text-sm text-muted-foreground font-code text-center py-4">
          {t("prerenderStats.noLogs")}
        </p>
      )}
    </div>
  );
}
