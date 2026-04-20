import type { Reto, ProviderEvent } from "./types";

export const METRIC_COLORS: Record<string, string> = {
  "Cámara obstruida": "#6366f1",
  "Exceso de velocidad": "#ef4444",
  "Sin cinturón de seguridad": "#f59e0b",
  "Distracción por teléfono": "#ec4899",
  "Frenado brusco": "#0ea5e9",
  "Aceleración brusca": "#14b8a6",
  "Curvas agresivas": "#8b5cf6",
  Somnolencia: "#a855f7",
  "Conducción distraída": "#f97316",
  "Sin eventos de seguridad": "#22c55e",
};

export const colorFor = (metric: string) =>
  METRIC_COLORS[metric] ?? "#64748b";

export type Period = "all" | "weekly" | "monthly";

export function isWeekly(type: string) {
  return type === "Semanal" || /^Semana\s*\d+/i.test(type);
}
export function isMonthly(type: string) {
  return type === "Mensual";
}

export function filterRetos(
  retos: Reto[],
  opts: {
    company?: string;
    driver?: string;
    type?: Period;
    from?: string;
    to?: string;
  } = {},
) {
  return retos.filter((r) => {
    if (opts.company && r.company !== opts.company) return false;
    if (opts.driver && r.driver !== opts.driver) return false;
    if (opts.type === "weekly" && !isWeekly(r.type)) return false;
    if (opts.type === "monthly" && !isMonthly(r.type)) return false;
    if (opts.from && (!r.endDate || r.endDate < opts.from)) return false;
    if (opts.to && (!r.endDate || r.endDate > opts.to)) return false;
    return true;
  });
}

export type DriverSummary = {
  driver: string;
  company: string;
  totalPoints: number;
  potentialPoints: number;
  completed: number;
  failed: number;
  totalChallenges: number;
  successRate: number;
  weeklyPoints: number;
  monthlyPoints: number;
  totalDistance: number;
  worstMetric: string | null;
  worstMetricEvents: number;
};

export function summarizeDrivers(retos: Reto[]): DriverSummary[] {
  const byDriver = new Map<string, Reto[]>();
  for (const r of retos) {
    const arr = byDriver.get(r.driver) ?? [];
    arr.push(r);
    byDriver.set(r.driver, arr);
  }
  const result: DriverSummary[] = [];
  for (const [driver, rows] of byDriver) {
    const completed = rows.filter((r) => r.status === "Completado");
    const failed = rows.filter((r) => r.status === "Fallido");
    const decided = completed.length + failed.length;
    const totalPoints = completed.reduce((a, r) => a + r.reward, 0);
    const potentialPoints = rows.reduce((a, r) => a + r.reward, 0);
    const weeklyPoints = completed
      .filter((r) => isWeekly(r.type))
      .reduce((a, r) => a + r.reward, 0);
    const monthlyPoints = completed
      .filter((r) => isMonthly(r.type))
      .reduce((a, r) => a + r.reward, 0);
    const distMap = new Map<string, number>();
    for (const r of rows) {
      const k = `${r.startDate}|${r.endDate}|${r.type}`;
      if (!distMap.has(k)) distMap.set(k, r.distanceKm);
    }
    const totalDistance = [...distMap.values()].reduce((a, b) => a + b, 0);
    const metricAgg = new Map<string, number>();
    for (const r of rows) {
      if (r.metric === "Sin eventos de seguridad") continue;
      metricAgg.set(r.metric, (metricAgg.get(r.metric) ?? 0) + r.count);
    }
    let worstMetric: string | null = null;
    let worstEvents = 0;
    for (const [m, c] of metricAgg) {
      if (c > worstEvents) {
        worstEvents = c;
        worstMetric = m;
      }
    }
    result.push({
      driver,
      company: rows[0].company,
      totalPoints,
      potentialPoints,
      completed: completed.length,
      failed: failed.length,
      totalChallenges: rows.length,
      successRate: decided ? completed.length / decided : 0,
      weeklyPoints,
      monthlyPoints,
      totalDistance,
      worstMetric,
      worstMetricEvents: worstEvents,
    });
  }
  return result.sort((a, b) => b.totalPoints - a.totalPoints);
}

export function aggregateByMetric(retos: Reto[]) {
  const map = new Map<
    string,
    { metric: string; events: number; points: number; failed: number; completed: number }
  >();
  for (const r of retos) {
    const cur = map.get(r.metric) ?? {
      metric: r.metric,
      events: 0,
      points: 0,
      failed: 0,
      completed: 0,
    };
    cur.events += r.count;
    if (r.status === "Completado") {
      cur.points += r.reward;
      cur.completed += 1;
    } else if (r.status === "Fallido") {
      cur.failed += 1;
    }
    map.set(r.metric, cur);
  }
  return [...map.values()];
}

export function timelineFromRetos(retos: Reto[]) {
  // Group by endDate, sum reward for completed only
  const map = new Map<
    string,
    { date: string; points: number; completed: number; failed: number }
  >();
  for (const r of retos) {
    if (!r.endDate) continue;
    const cur = map.get(r.endDate) ?? {
      date: r.endDate,
      points: 0,
      completed: 0,
      failed: 0,
    };
    if (r.status === "Completado") {
      cur.points += r.reward;
      cur.completed += 1;
    } else if (r.status === "Fallido") {
      cur.failed += 1;
    }
    map.set(r.endDate, cur);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function eventsByDay(events: ProviderEvent[]) {
  const map = new Map<string, { date: string; events: number; distance: number }>();
  const distSeen = new Set<string>();
  for (const e of events) {
    if (!e.date) continue;
    const cur = map.get(e.date) ?? { date: e.date, events: 0, distance: 0 };
    cur.events += e.eventCount;
    const dk = `${e.driver}|${e.date}`;
    if (!distSeen.has(dk)) {
      cur.distance += e.distanceKm;
      distSeen.add(dk);
    }
    map.set(e.date, cur);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function uniqueDrivers(retos: Reto[], company?: string) {
  const set = new Set<string>();
  for (const r of retos) {
    if (company && r.company !== company) continue;
    set.add(r.driver);
  }
  return [...set].sort();
}

export function uniqueCompanies(retos: Reto[]) {
  return [...new Set(retos.map((r) => r.company))].sort();
}

export function dateRange(retos: Reto[]) {
  let min: string | null = null;
  let max: string | null = null;
  for (const r of retos) {
    if (!r.endDate) continue;
    if (!min || r.endDate < min) min = r.endDate;
    if (!max || r.endDate > max) max = r.endDate;
  }
  return { min, max };
}

export function fmtNum(n: number) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(n);
}

export function fmtPct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}
