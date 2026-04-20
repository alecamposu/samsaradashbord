import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useState } from "react";
import * as XLSX from "xlsx";
import { useDataset } from "@/lib/data-store";
import type { Reto, ProviderEvent } from "@/lib/types";

export const Route = createFileRoute("/cargar")({
  head: () => ({
    meta: [
      { title: "Cargar reporte — Apex Driver Insights" },
      {
        name: "description",
        content:
          "Sube reportes semanales en formato Excel y consolídalos al dashboard.",
      },
    ],
  }),
  component: UploadPage,
});

function toIso(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date
    const ms = (v - 25569) * 86400 * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = String(v);
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s.slice(0, 10);
}

function num(v: unknown, d = 0): number {
  if (v == null || v === "") return d;
  const n = Number(v);
  return isNaN(n) ? d : n;
}

function str(v: unknown): string {
  return (v == null ? "" : String(v)).trim();
}

function UploadPage() {
  const merge = useDataset((s) => s.mergeRetos);
  const mergeP = useDataset((s) => s.mergeProvider);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ retos: number; provider: number } | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError(null);
    setStatus("Procesando…");
    try {
      let totalR = 0;
      let totalP = 0;
      for (const file of Array.from(files)) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { cellDates: true });
        const period = file.name.match(/(20\d{2}-\d{2})/)?.[1] ?? "manual";

        if (wb.SheetNames.includes("Retos")) {
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
            wb.Sheets["Retos"],
            { defval: null },
          );
          const retos: Reto[] = rows
            .filter((r) => r["Nombre Conductor"])
            .map((r) => ({
              driver: str(r["Nombre Conductor"]),
              company: str(r["Empresa"]),
              type: str(r["Tipo de Desafío"]),
              status: str(r["Estado de Desafío"]),
              reason: str(r["Motivo de Desafío"]) || null,
              startDate: toIso(r["Fecha de Inicio"]),
              endDate: toIso(r["Fecha de Fin"]),
              distanceKm: num(r["Distancia (km)"]),
              minDistanceKm: num(r["Distancia mínima (km)"]),
              score: num(r["Calificación"]),
              metric: str(r["Métrica"]),
              count: num(r["Conteo"]),
              limit: num(r["Límite"]),
              reward: num(r["Recompensa"]),
              period,
            }));
          merge(retos);
          totalR += retos.length;
        }

        if (wb.SheetNames.includes("Datos Proveedor")) {
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
            wb.Sheets["Datos Proveedor"],
            { defval: null },
          );
          const events: ProviderEvent[] = rows
            .filter((r) => r["Nombre del Conductor"])
            .map((r) => ({
              driver: str(r["Nombre del Conductor"]),
              company: str(r["Empresa"]),
              provider: str(r["Proveedor"]) || null,
              date: toIso(r["Fecha"]),
              distanceKm: num(r["Distancia (km)"]),
              score: num(r["Calificación"]),
              metric: str(r["Métrica"]),
              eventCount: num(r["Conteo de Eventos"]),
              period,
            }));
          mergeP(events);
          totalP += events.length;
        }
      }
      setStatus(null);
      setCounts({ retos: totalR, provider: totalP });
    } catch (e) {
      setStatus(null);
      setError(e instanceof Error ? e.message : "Error al procesar archivos");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Cargar nuevo reporte
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Arrastra uno o más archivos <code className="rounded bg-secondary px-1.5 py-0.5 text-sm">.xlsx</code>{" "}
          con las hojas <em>Retos</em> y/o <em>Datos Proveedor</em>. Los datos se
          suman a la sesión actual y se reflejan inmediatamente en los
          dashboards.
        </p>

        <label
          className="mt-10 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card px-8 py-16 text-center transition hover:border-foreground/40 hover:bg-secondary/40"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="font-display text-2xl font-semibold tracking-tight">
            Suelta tus archivos aquí
          </div>
          <div className="text-sm text-muted-foreground">
            o haz click para seleccionar (.xlsx)
          </div>
          <input
            type="file"
            accept=".xlsx"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {status && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {counts && (
          <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-5 text-sm text-success">
            Se importaron <span className="num font-semibold">{counts.retos}</span>{" "}
            retos y{" "}
            <span className="num font-semibold">{counts.provider}</span> eventos
            de proveedor.
            <Link to="/" className="ml-2 underline">
              Ver dashboards →
            </Link>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-border/70 bg-secondary/30 p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Nota:</strong> los datos cargados
          viven solo en tu navegador. Al recargar la página se vuelve al dataset
          pre-cargado.
        </div>
      </main>
    </div>
  );
}
