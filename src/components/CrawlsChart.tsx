import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PrerenderLog {
  id: number;
  created_at: string;
  cached: boolean;
  url: string;
  domain: string;
  user_agent: string;
  site_id: string;
}

interface CrawlsChartProps {
  prerenderLogs: PrerenderLog[];
}

export function CrawlsChart({ prerenderLogs }: CrawlsChartProps) {
  const { t, lang } = useI18n();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; cached: number; fresh: number; total: number }> = {};

    prerenderLogs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "short",
      });

      if (!grouped[date]) grouped[date] = { date, cached: 0, fresh: 0, total: 0 };

      if (log.cached) grouped[date].cached++;
      else grouped[date].fresh++;

      grouped[date].total++;
    });

    return Object.values(grouped).reverse();
  }, [prerenderLogs, dateLocale]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground font-code text-sm">
        {t("dashboard.chart.noData")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorFresh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={{ stroke: "hsl(var(--border))" }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontFamily: "monospace",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }} />

        <Area
          type="monotone"
          dataKey="cached"
          name={t("dashboard.chart.cached") || "Cached"}
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorCached)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="fresh"
          name={t("dashboard.chart.fresh") || "Fresh"}
          stroke="hsl(var(--secondary))"
          fillOpacity={1}
          fill="url(#colorFresh)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
