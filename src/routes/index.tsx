import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { CompanyOverview, GlobalSummary } from "@/components/company-overview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Driver Insights — Dashboard de incentivos por flota" },
      {
        name: "description",
        content:
          "Visualiza puntos, retos completados y hábitos semana a semana para cada conductor y empresa.",
      },
      { property: "og:title", content: "Apex Driver Insights" },
      {
        property: "og:description",
        content:
          "Dashboard interactivo de seguridad vial e incentivos para conductores.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 py-12">
        <section className="mb-12 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Programa de incentivos · {new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </div>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            Cada kilómetro,{" "}
            <span className="italic text-muted-foreground">una decisión</span>{" "}
            que premiar.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Resumen ejecutivo del desempeño de tus flotas. Selecciona una empresa
            para ver el ranking de conductores y profundizar en sus hábitos
            semana a semana.
          </p>
        </section>

        <section className="mb-12">
          <GlobalSummary />
        </section>

        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Empresas
            </h2>
            <span className="text-sm text-muted-foreground">
              Click para ver el detalle
            </span>
          </div>
          <CompanyOverview />
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Datos pre-cargados desde reportes Samsara · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
