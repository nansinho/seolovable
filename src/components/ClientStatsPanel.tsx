import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart3, CheckCircle, RefreshCw, TrendingUp, Database, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PrerenderLog {
  id: number;
  url: string;
  domain: string;
  user_agent: string;
  cached: boolean;
  created_at: string;
}

interface ClientStatsPanelProps {
  clientId: string;
}

export function ClientStatsPanel({ clientId }: ClientStatsPanelProps) {
  const [logs, setLogs] = useState<PrerenderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch logs for this client
  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("prerender_logs")
        .select("id, url, domain, user_agent, cached, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [clientId]);

  // Realtime subscription for new logs
  useEffect(() => {
    const channel = supabase
      .channel(`prerender_logs_client_${clientId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "prerender_logs",
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          const newLog = payload.new as PrerenderLog;
          setLogs(prev => [newLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  // Calculate stats from logs
  const stats = useMemo(() => {
    const total = logs.length;
    const cached = logs.filter(l => l.cached).length;
    const fresh = logs.filter(l => !l.cached).length;
    const cacheRate = total > 0 ? Math.round((cached / total) * 100) : 0;
    return { total, cached, fresh, cacheRate };
  }, [logs]);

  // Monthly breakdown for chart (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { name: string; total: number; cached: number; fresh: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= monthStart && logDate <= monthEnd;
      });
      
      months.push({
        name: format(monthDate, "MMM", { locale: fr }),
        total: monthLogs.length,
        cached: monthLogs.filter(l => l.cached).length,
        fresh: monthLogs.filter(l => !l.cached).length,
      });
    }
    
    return months;
  }, [logs]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Database className="h-3 w-3 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.cached}</p>
          <p className="text-xs text-muted-foreground">Cache</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="h-3 w-3 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500">{stats.fresh}</p>
          <p className="text-xs text-muted-foreground">Fresh</p>
        </div>
      </div>

      {/* Cache Hit Rate */}
      {stats.total > 0 && (
        <div className="bg-muted rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Cache hit rate</span>
            <span className="font-bold">{stats.cacheRate}%</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${stats.cacheRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      {monthlyData.some(m => m.total > 0) && (
        <div className="bg-muted rounded-lg p-3">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Renders par mois
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={monthlyData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === "cached" ? "Cache" : name === "fresh" ? "Fresh" : "Total"
                ]}
              />
              <Bar dataKey="cached" stackId="a" fill="hsl(142, 76%, 36%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fresh" stackId="a" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Logs */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Derniers logs ({logs.length})
        </h4>
        <ScrollArea className="h-[200px]">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun log pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 50).map(log => (
                <div
                  key={log.id}
                  className="text-xs bg-muted rounded p-2 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={log.cached ? "default" : "secondary"} className="text-[10px]">
                      {log.cached ? (
                        <CheckCircle className="h-2 w-2 mr-1" />
                      ) : (
                        <RefreshCw className="h-2 w-2 mr-1" />
                      )}
                      {log.cached ? "Cache" : "Fresh"}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p className="truncate font-medium" title={log.url}>
                    {log.domain}
                  </p>
                  <p className="truncate text-muted-foreground" title={log.url}>
                    {log.url.replace(/^https?:\/\/[^/]+/, '')}
                  </p>
                  <p className="truncate text-muted-foreground opacity-60" title={log.user_agent}>
                    {log.user_agent.length > 60 ? `${log.user_agent.slice(0, 60)}...` : log.user_agent}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
