import type { TemplateRow } from "@/lib/types";
import { colorFor } from "@/lib/analytics";
import { fmtNum } from "@/lib/analytics";

type Props = {
  rows: TemplateRow[];
};

export function TemplateParams({ rows }: Props) {
  const active = rows.filter((r) => r.active);
  const totalBudget = active.reduce((a, r) => a + (r.budget || 0), 0);
  const totalWeekly = active.reduce((a, r) => a + (r.weeklyReward || 0), 0);
  const totalMonthly = active.reduce((a, r) => a + (r.monthlyReward || 0), 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Parámetros de retos
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Límites y recompensas que cada conductor debe cumplir para ganar
            puntos
          </p>
        </div>
        <div className="flex flex-wrap items-baseline gap-6 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Presupuesto/conductor
            </div>
            <div className="font-display text-2xl font-semibold num">
              {fmtNum(totalBudget)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Pts máx. semana
            </div>
            <div className="font-display text-2xl font-semibold num">
              {fmtNum(totalWeekly)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Pts máx. mes
            </div>
            <div className="font-display text-2xl font-semibold num">
              {fmtNum(totalMonthly)}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Hábito</th>
              <th className="px-5 py-3 text-center font-medium">Activo</th>
              <th
                className="px-5 py-3 text-right font-medium"
                title="Puntos máximos por conductor"
              >
                Presupuesto
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                colSpan={2}
                title="Reto semanal"
              >
                Reto semanal
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                colSpan={2}
                title="Reto mensual"
              >
                Reto mensual
              </th>
            </tr>
            <tr className="border-b border-border/70 bg-secondary/20 text-right text-[10px] uppercase tracking-wider text-muted-foreground">
              <th />
              <th />
              <th className="px-5 py-2 font-normal">pts</th>
              <th className="px-5 py-2 font-normal">Límite eventos</th>
              <th className="px-5 py-2 font-normal">Recompensa</th>
              <th className="px-5 py-2 font-normal">Límite eventos</th>
              <th className="px-5 py-2 font-normal">Recompensa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.metric}
                className={
                  "border-b border-border/40 last:border-0 " +
                  (r.active ? "" : "opacity-50")
                }
              >
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: colorFor(r.metric) }}
                    />
                    <span className="font-medium">{r.metric}</span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  {r.active ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-success" />
                  ) : (
                    <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                  )}
                </td>
                <td className="px-5 py-3.5 text-right num font-display text-base font-semibold">
                  {fmtNum(r.budget)}
                </td>
                <td className="px-5 py-3.5 text-right num text-muted-foreground">
                  ≤ {fmtNum(r.weeklyLimit)}
                </td>
                <td className="px-5 py-3.5 text-right num">
                  {fmtNum(r.weeklyReward)}
                </td>
                <td className="px-5 py-3.5 text-right num text-muted-foreground">
                  ≤ {fmtNum(r.monthlyLimit)}
                </td>
                <td className="px-5 py-3.5 text-right num">
                  {fmtNum(r.monthlyReward)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/70 bg-secondary/20 px-6 py-3 text-[11px] text-muted-foreground">
        El conductor gana la recompensa cuando sus eventos detectados se
        mantienen <strong className="text-foreground">por debajo o igual</strong>{" "}
        al límite del periodo correspondiente.
      </div>
    </div>
  );
}
