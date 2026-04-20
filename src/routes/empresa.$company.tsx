import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useDataset } from "@/lib/data-store";
import {
  filterRetos,
  summarizeDrivers,
  uniqueCompanies,
  fmtNum,
  dateRange,
  type Period,
} from "@/lib/analytics";
import { useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { MetricsBar } from "@/components/metrics-bar";
import { PointsTimeline } from "@/components/points-timeline";
import { DriverTable } from "@/components/driver-table";
import { PeriodFilter, DateRangeFilter } from "@/components/filters";

export const Route = createFileRoute("/empresa/$company")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.company} — Dashboard de conductores` },
      {
        name: "description",
        content: `Ranking, retos y hábitos por conductor en ${params.company}.`,
      },
      { property: "og:title", content: `${params.company} — Apex Insights` },
    ],
  }),
  component: CompanyPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-display text-3xl">Empresa no encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  ),
});

function CompanyPage() {
  const { company } = Route.useParams();
  const data = useDataset((s) => s.data);
  const companies = uniqueCompanies(data.retos);
  if (!companies.includes(company)) throw notFound();

  const range = useMemo(
    () => dateRange(filterRetos(data.retos, { company })),
    [data.retos, company],
  );
  const [period, setPeriod] = useState<Period>("all");
  const [from, setFrom] = useState(range.min ?? "");
  const [to, setTo] = useState(range.max ?? "");

  const retos = useMemo(
    () =>
      filterRetos(data.retos, {
        company,
        type: period,
        from: from || undefined,
        to: to || undefined,
      }),
    [data.retos, company, period, from, to],
  );

  const drivers = useMemo(() => summarizeDrivers(retos), [retos]);
  const totalPoints = drivers.reduce((a, d) => a + d.totalPoints, 0);
  const completed = drivers.reduce((a, d) => a + d.completed, 0);
  const failed = drivers.reduce((a, d) => a + d.failed, 0);
  const decided = completed + failed;
  const totalKm = drivers.reduce((a, d) => a + d.totalDistance, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Resumen
          </Link>
          <span>/</span>
          <span className="text-foreground">{company}</span>
        </div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {company}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {drivers.length} conductores · ventana{" "}
              <span className="num">{from || "—"}</span> →{" "}
              <span className="num">{to || "—"}</span>
            </p>
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
          <StatCard label="Puntos otorgados" value={fmtNum(totalPoints)} />
          <StatCard
            label="Retos completados"
            value={fmtNum(completed)}
            hint={`${fmtNum(failed)} fallidos`}
          />
          <StatCard
            label="Tasa de éxito"
            value={`${decided ? Math.round((completed / decided) * 100) : 0}%`}
          />
          <StatCard
            label="Distancia recorrida"
            value={`${fmtNum(totalKm)} km`}
          />
        </section>

        <section className="mb-10 grid gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-border/70 bg-card p-6 lg:col-span-3">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Puntos otorgados en el tiempo
              </h2>
              <span className="text-xs text-muted-foreground">
                Por fecha de cierre del reto
              </span>
            </div>
            <PointsTimeline retos={retos} />
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-6 lg:col-span-2">
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Eventos por hábito
              </h2>
              <p className="text-xs text-muted-foreground">
                Suma de eventos detectados en el periodo
              </p>
            </div>
            <MetricsBar retos={retos} />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ranking de conductores
            </h2>
            <span className="text-sm text-muted-foreground">
              Ordenado por puntos
            </span>
          </div>
          <DriverTable drivers={drivers} company={company} />
        </section>
      </main>
    </div>
  );
}
