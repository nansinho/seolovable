import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart3, CheckCircle, RefreshCw } from "lucide-react";

interface ClientStats {
  total_renders: number;
  cached_renders: number;
  fresh_renders: number;
}

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
  stats?: ClientStats;
}

export function ClientStatsPanel({ clientId, stats }: ClientStatsPanelProps) {
  const [logs, setLogs] = useState<PrerenderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("prerender_logs")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats?.total_renders || 0}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-500">
            {stats?.cached_renders || 0}
          </p>
          <p className="text-xs text-muted-foreground">Cache</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {stats?.fresh_renders || 0}
          </p>
          <p className="text-xs text-muted-foreground">Fresh</p>
        </div>
      </div>

      {/* Cache Hit Rate */}
      {stats && stats.total_renders > 0 && (
        <div className="bg-muted rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Cache hit rate</span>
            <span className="font-bold">
              {Math.round((stats.cached_renders / stats.total_renders) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width: `${(stats.cached_renders / stats.total_renders) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Logs */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Derniers logs
        </h4>
        <ScrollArea className="h-[200px]">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun log pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
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
                  <p className="truncate text-muted-foreground" title={log.url}>
                    {log.url}
                  </p>
                  <p className="truncate text-muted-foreground opacity-60" title={log.user_agent}>
                    {log.user_agent.slice(0, 50)}...
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
