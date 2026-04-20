import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  filterRetos,
  summarizeDrivers,
  uniqueCompanies,
  fmtNum,
} from "@/lib/analytics";
import { useDataset } from "@/lib/data-store";
import { StatCard } from "./stat-card";

export function CompanyOverview() {
  const data = useDataset((s) => s.data);
  const companies = useMemo(() => uniqueCompanies(data.retos), [data.retos]);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => {
        const retos = filterRetos(data.retos, { company });
        const drivers = summarizeDrivers(retos);
        const totalPoints = drivers.reduce((a, d) => a + d.totalPoints, 0);
        const potential = drivers.reduce((a, d) => a + d.potentialPoints, 0);
        const driverCount = drivers.length;
        const avgScore = potential
          ? Math.round((totalPoints / potential) * 100)
          : 0;
        const top = drivers[0];
        return (
          <Link
            key={company}
            to="/empresa/$company"
            params={{ company }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-7 transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Flota
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  {company}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition group-hover:border-foreground group-hover:text-foreground">
                →
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Conductores</div>
                <div className="mt-1 font-display text-2xl font-semibold num">
                  {driverCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Puntos</div>
                <div className="mt-1 font-display text-2xl font-semibold num">
                  {fmtNum(totalPoints)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Eficiencia</div>
                <div className="mt-1 font-display text-2xl font-semibold num">
                  {avgScore}%
                </div>
              </div>
            </div>
            {top && (
              <div className="mt-6 border-t border-border/70 pt-4 text-sm">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Top conductor
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium">{top.driver}</span>
                  <span className="num text-muted-foreground">
                    {fmtNum(top.totalPoints)} pts
                  </span>
                </div>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function GlobalSummary() {
  const data = useDataset((s) => s.data);
  const drivers = summarizeDrivers(data.retos);
  const totalPoints = drivers.reduce((a, d) => a + d.totalPoints, 0);
  const totalChallenges = drivers.reduce((a, d) => a + d.totalChallenges, 0);
  const completed = drivers.reduce((a, d) => a + d.completed, 0);
  const totalKm = drivers.reduce((a, d) => a + d.totalDistance, 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Conductores activos" value={fmtNum(drivers.length)} />
      <StatCard
        label="Puntos otorgados"
        value={fmtNum(totalPoints)}
        hint={`${fmtNum(completed)} de ${fmtNum(totalChallenges)} retos`}
      />
      <StatCard
        label="Tasa de éxito"
        value={`${totalChallenges ? Math.round((completed / totalChallenges) * 100) : 0}%`}
      />
      <StatCard
        label="Kilometraje total"
        value={`${fmtNum(totalKm / 1000)}k km`}
      />
    </div>
  );
}
