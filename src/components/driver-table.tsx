import { Link } from "@tanstack/react-router";
import type { DriverSummary } from "@/lib/analytics";
import { fmtNum, fmtPct } from "@/lib/analytics";

export function DriverTable({
  drivers,
  company,
}: {
  drivers: DriverSummary[];
  company: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Conductor</th>
              <th className="px-5 py-3 text-right font-medium">Puntos</th>
              <th className="px-5 py-3 text-right font-medium">Éxito</th>
              <th className="px-5 py-3 text-right font-medium">Retos</th>
              <th className="hidden px-5 py-3 text-right font-medium md:table-cell">
                Distancia
              </th>
              <th className="hidden px-5 py-3 font-medium lg:table-cell">
                Hábito a vigilar
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => (
              <tr
                key={d.driver}
                className="border-b border-border/40 transition last:border-0 hover:bg-secondary/30"
              >
                <td className="px-5 py-4 text-muted-foreground num">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-5 py-4">
                  <Link
                    to="/empresa/$company/conductor/$driver"
                    params={{ company, driver: d.driver }}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {d.driver}
                  </Link>
                </td>
                <td className="px-5 py-4 text-right font-display text-base font-semibold num">
                  {fmtNum(d.totalPoints)}
                </td>
                <td className="px-5 py-4 text-right num">
                  <span
                    className={
                      d.successRate >= 0.7
                        ? "rounded-full bg-success/15 px-2 py-0.5 text-success"
                        : d.successRate >= 0.4
                          ? "rounded-full bg-warning/20 px-2 py-0.5 text-warning-foreground"
                          : "rounded-full bg-destructive/15 px-2 py-0.5 text-destructive"
                    }
                  >
                    {fmtPct(d.successRate)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right num text-muted-foreground">
                  {d.completed}/{d.totalChallenges}
                </td>
                <td className="hidden px-5 py-4 text-right num text-muted-foreground md:table-cell">
                  {fmtNum(d.totalDistance)} km
                </td>
                <td className="hidden px-5 py-4 text-muted-foreground lg:table-cell">
                  {d.worstMetric ? (
                    <span>
                      {d.worstMetric}{" "}
                      <span className="num text-foreground/60">
                        ({d.worstMetricEvents})
                      </span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
