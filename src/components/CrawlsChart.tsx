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

interface BotActivity {
  id: string;
  bot_name: string;
  bot_type: string;
  pages_crawled: number;
  crawled_at: string;
}

interface CrawlsChartProps {
  botActivity: BotActivity[];
}

export function CrawlsChart({ botActivity }: CrawlsChartProps) {
  const { t, lang } = useI18n();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; google: number; ai: number; total: number }> = {};

    botActivity.forEach((activity) => {
      const date = new Date(activity.crawled_at).toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "short",
      });

      if (!grouped[date]) grouped[date] = { date, google: 0, ai: 0, total: 0 };

      if (activity.bot_type === "search") grouped[date].google += activity.pages_crawled;
      else grouped[date].ai += activity.pages_crawled;

      grouped[date].total += activity.pages_crawled;
    });

    return Object.values(grouped).reverse();
  }, [botActivity, dateLocale]);

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
          <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="google"
          name={t("dashboard.chart.google")}
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorGoogle)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="ai"
          name={t("dashboard.chart.ai")}
          stroke="hsl(var(--secondary))"
          fillOpacity={1}
          fill="url(#colorAI)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
