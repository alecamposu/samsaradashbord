import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useDataset } from "@/lib/data-store";
import {
  filterRetos,
  fmtNum,
  fmtPct,
  dateRange,
  aggregateByMetric,
  colorFor,
  type Period,
} from "@/lib/analytics";
import { useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { PointsTimeline } from "@/components/points-timeline";
import { MetricsBar } from "@/components/metrics-bar";
import { PeriodFilter, DateRangeFilter } from "@/components/filters";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/empresa/$company/conductor/$driver")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.driver} — ${params.company}` },
      {
        name: "description",
        content: `Detalle de retos, puntos y hábitos de ${params.driver}.`,
      },
    ],
  }),
  component: DriverPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl">Conductor no encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Volver
        </Link>
      </div>
    </div>
  ),
});

function DriverPage() {
  const { company, driver } = Route.useParams();
  const data = useDataset((s) => s.data);
  const allDriverRetos = useMemo(
    () => filterRetos(data.retos, { company, driver }),
    [data.retos, company, driver],
  );
  if (!allDriverRetos.length) throw notFound();

  const range = useMemo(() => dateRange(allDriverRetos), [allDriverRetos]);
  const [period, setPeriod] = useState<Period>("all");
  const [from, setFrom] = useState(range.min ?? "");
  const [to, setTo] = useState(range.max ?? "");

  const retos = useMemo(
    () =>
      filterRetos(data.retos, {
        company,
        driver,
        type: period,
        from: from || undefined,
        to: to || undefined,
      }),
    [data.retos, company, driver, period, from, to],
  );

  const completed = retos.filter((r) => r.status === "Completado");
  const failed = retos.filter((r) => r.status === "Fallido");
  const totalPoints = completed.reduce((a, r) => a + r.reward, 0);
  const potential = retos.reduce((a, r) => a + r.reward, 0);
  const successRate = retos.length ? completed.length / retos.length : 0;

  const distMap = new Map<string, number>();
  for (const r of retos) {
    const k = `${r.startDate}|${r.endDate}|${r.type}`;
    if (!distMap.has(k)) distMap.set(k, r.distanceKm);
  }
  const distance = [...distMap.values()].reduce((a, b) => a + b, 0);

  const metricRows = aggregateByMetric(retos)
    .filter((m) => m.metric !== "Sin eventos de seguridad")
    .sort((a, b) => b.events - a.events);

  // Group challenges by window (start-end-type)
  type Win = {
    key: string;
    type: string;
    startDate: string | null;
    endDate: string | null;
    completed: number;
    failed: number;
    earned: number;
    possible: number;
    metrics: { metric: string; status: string; count: number; limit: number; reward: number }[];
  };
  const windows = new Map<string, Win>();
  for (const r of retos) {
    const k = `${r.type}|${r.startDate}|${r.endDate}`;
    const w = windows.get(k) ?? {
      key: k,
      type: r.type,
      startDate: r.startDate,
      endDate: r.endDate,
      completed: 0,
      failed: 0,
      earned: 0,
      possible: 0,
      metrics: [],
    };
    w.metrics.push({
      metric: r.metric,
      status: r.status,
      count: r.count,
      limit: r.limit,
      reward: r.reward,
    });
    w.possible += r.reward;
    if (r.status === "Completado") {
      w.completed += 1;
      w.earned += r.reward;
    } else if (r.status === "Fallido") w.failed += 1;
    windows.set(k, w);
  }
  const winList = [...windows.values()].sort((a, b) =>
    (b.endDate ?? "").localeCompare(a.endDate ?? ""),
  );

  const fmtDate = (s: string | null) => {
    if (!s) return "—";
    try {
      return format(parseISO(s), "dd MMM yyyy", { locale: es });
    } catch {
      return s;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Resumen
          </Link>
          <span>/</span>
          <Link
            to="/empresa/$company"
            params={{ company }}
            className="hover:text-foreground"
          >
            {company}
          </Link>
          <span>/</span>
          <span className="text-foreground">{driver}</span>
        </div>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Conductor
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {driver}
            </h1>
            <p className="mt-2 text-muted-foreground">{company}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PeriodFilter value={period} onChange={setPeriod} />
            {range.min && range.max && (
              <DateRangeFilter
                from={from}
                to={to}
                min={range.min}
                max={range.max}
                onChange={(f, t) => {
                  setFrom(f);
                  setTo(t);
                }}
              />
            )}
          </div>
        </div>

        <section className="mb-10 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Puntos ganados"
            value={fmtNum(totalPoints)}
            hint={`de ${fmtNum(potential)} posibles`}
          />
          <StatCard
            label="Retos completados"
            value={`${completed.length}`}
            hint={`${failed.length} fallidos`}
          />
          <StatCard label="Tasa de éxito" value={fmtPct(successRate)} />
          <StatCard label="Distancia" value={`${fmtNum(distance)} km`} />
        </section>

        <section className="mb-10 grid gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-border/70 bg-card p-6 lg:col-span-3">
            <h2 className="mb-1 font-display text-xl font-semibold tracking-tight">
              Evolución de puntos
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Por fecha de fin de cada reto
            </p>
            <PointsTimeline retos={retos} />
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-6 lg:col-span-2">
            <h2 className="mb-1 font-display text-xl font-semibold tracking-tight">
              Hábitos
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Eventos detectados por métrica
            </p>
            <MetricsBar retos={retos} />
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Detalle por hábito
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Hábito</th>
                  <th className="px-5 py-3 text-right font-medium">Eventos</th>
                  <th className="px-5 py-3 text-right font-medium">Completados</th>
                  <th className="px-5 py-3 text-right font-medium">Fallidos</th>
                  <th className="px-5 py-3 text-right font-medium">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {metricRows.map((m) => (
                  <tr
                    key={m.metric}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: colorFor(m.metric) }}
                        />
                        {m.metric}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right num">{fmtNum(m.events)}</td>
                    <td className="px-5 py-3 text-right num text-success">
                      {m.completed}
                    </td>
                    <td className="px-5 py-3 text-right num text-destructive">
                      {m.failed}
                    </td>
                    <td className="px-5 py-3 text-right font-display text-base font-semibold num">
                      {fmtNum(m.points)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ventanas de reto
            </h2>
            <span className="text-sm text-muted-foreground">
              Más recientes primero
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {winList.map((w) => {
              const rate = w.possible ? w.earned / w.possible : 0;
              return (
                <div
                  key={w.key}
                  className="rounded-2xl border border-border/70 bg-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider " +
                          (w.type === "Mensual"
                            ? "border-accent/40 bg-accent/10 text-accent-foreground"
                            : "border-border bg-secondary text-muted-foreground")
                        }
                      >
                        {w.type}
                      </span>
                      <div className="mt-2 font-display text-lg font-semibold">
                        {fmtDate(w.startDate)} → {fmtDate(w.endDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-semibold num">
                        {fmtNum(w.earned)}
                      </div>
                      <div className="text-xs text-muted-foreground num">
                        / {fmtNum(w.possible)} pts
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-success transition-all"
                      style={{ width: `${Math.min(100, rate * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {w.metrics.map((m, i) => (
                      <span
                        key={i}
                        title={`${m.metric}: ${m.count}/${m.limit}`}
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] " +
                          (m.status === "Completado"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive")
                        }
                      >
                        {m.metric.split(" ")[0]} {m.count}/{m.limit}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
