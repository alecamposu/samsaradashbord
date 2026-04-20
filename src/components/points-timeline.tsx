import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { timelineFromRetos, fmtNum } from "@/lib/analytics";
import type { Reto } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function PointsTimeline({ retos }: { retos: Reto[] }) {
  const data = timelineFromRetos(retos);
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Sin retos cerrados en el rango
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: 0, right: 20, top: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="ptsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              try {
                return format(parseISO(v), "dd MMM", { locale: es });
              } catch {
                return v;
              }
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--card)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
            }}
            labelFormatter={(v) => {
              try {
                return format(parseISO(String(v)), "dd MMM yyyy", { locale: es });
              } catch {
                return String(v);
              }
            }}
            formatter={(value, name) => [fmtNum(Number(value)), name === "points" ? "Puntos" : String(name)]}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke="var(--accent)"
            strokeWidth={2.5}
            fill="url(#ptsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
