import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Database, Zap, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PrerenderLog {
  id: number;
  created_at: string;
  cached: boolean;
  url: string;
  user_agent: string;
  domain: string;
}

interface SitePrerenderStatsProps {
  siteId: string;
}

export function SitePrerenderStats({ siteId }: SitePrerenderStatsProps) {
  const [logs, setLogs] = useState<PrerenderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, lang } = useI18n();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("prerender_logs")
        .select("id, created_at, cached, url, user_agent, domain")
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

  const stats = useMemo(() => {
    const total = logs.length;
    const cached = logs.filter((l) => l.cached).length;
    const fresh = total - cached;
    const cacheRate = total > 0 ? Math.round((cached / total) * 100) : 0;
    return { total, cached, fresh, cacheRate };
  }, [logs]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { [key: string]: { total: number; cached: number; fresh: number } } = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = { total: 0, cached: 0, fresh: 0 };
    }

    logs.forEach((log) => {
      const d = new Date(log.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (months[key]) {
        months[key].total++;
        if (log.cached) months[key].cached++;
        else months[key].fresh++;
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
          <Database className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold font-code text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground font-code">
            {t("prerenderStats.total")}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
          <Zap className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold font-code text-green-500">{stats.cached}</p>
          <p className="text-xs text-muted-foreground font-code">
            {t("prerenderStats.cached")}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center">
          <Clock className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold font-code text-orange-500">{stats.fresh}</p>
          <p className="text-xs text-muted-foreground font-code">
            {t("prerenderStats.fresh")}
          </p>
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

      {/* Monthly Chart */}
      {monthlyData.some((m) => m.total > 0) && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-code mb-3">
            {t("prerenderStats.last6months")}
          </p>
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
              <Bar dataKey="cached" fill="hsl(var(--primary))" name={t("prerenderStats.cached")} radius={[4, 4, 0, 0]} />
              <Bar dataKey="fresh" fill="hsl(var(--accent))" name={t("prerenderStats.fresh")} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-code mb-2">
            {t("prerenderStats.recentLogs")}
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 text-xs font-code"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.cached ? "bg-green-500" : "bg-orange-500"
                    }`}
                  />
                  <span className="text-muted-foreground truncate">{log.url}</span>
                </div>
                <span className="text-muted-foreground/70 flex-shrink-0 ml-2">
                  {new Date(log.created_at).toLocaleTimeString(dateLocale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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
