import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { aggregateByMetric, colorFor, fmtNum } from "@/lib/analytics";
import type { Reto } from "@/lib/types";

export function MetricsBar({ retos }: { retos: Reto[] }) {
  const data = aggregateByMetric(retos)
    .filter((d) => d.metric !== "Sin eventos de seguridad")
    .sort((a, b) => b.events - a.events);

  if (!data.length) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        Sin eventos en este periodo
      </div>
    );
  }

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="metric"
            width={170}
            tick={{ fontSize: 12, fill: "var(--foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--secondary)" }}
            contentStyle={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--card)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              boxShadow: "0 10px 40px -20px rgba(0,0,0,0.2)",
            }}
            formatter={(value) => [fmtNum(Number(value)), "Eventos"]}
          />
          <Bar dataKey="events" radius={[0, 6, 6, 0]}>
            {data.map((d) => (
              <Cell key={d.metric} fill={colorFor(d.metric)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
