import { Link } from "@tanstack/react-router";
import { uniqueCompanies } from "@/lib/analytics";
import { useDataset } from "@/lib/data-store";
import { useMemo } from "react";

export function SiteHeader() {
  const data = useDataset((s) => s.data);
  const companies = useMemo(() => uniqueCompanies(data.retos), [data.retos]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-display text-lg font-semibold">A</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight">
              Apex Driver Insights
            </div>
            <div className="text-xs text-muted-foreground">
              Programa de incentivos · seguridad vial
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-secondary text-foreground" }}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Resumen
          </Link>
          {companies.map((c) => (
            <Link
              key={c}
              to="/empresa/$company"
              params={{ company: c }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              {c}
            </Link>
          ))}
          <Link
            to="/cargar"
            activeProps={{ className: "bg-secondary text-foreground" }}
            className="ml-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-secondary"
          >
            + Cargar reporte
          </Link>
        </nav>
      </div>
    </header>
  );
}
