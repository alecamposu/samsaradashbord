import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { CompanyOverview, GlobalSummary } from "@/components/company-overview";
import heroIllustration from "@/assets/airbag-analytics.png";
import conductorIllustration from "@/assets/airbag-conductor.jpg";
import acumulaIllustration from "@/assets/airbag-acumula.jpg";
import calificaIllustration from "@/assets/airbag-califica.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "airbag · Driver Insights — Programa de incentivos por flota" },
      {
        name: "description",
        content:
          "#CreatingBetterDrivers — Visualiza puntos, retos completados y hábitos semana a semana para cada conductor y empresa.",
      },
      { property: "og:title", content: "airbag · Driver Insights" },
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
        <section className="mb-16 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-yellow)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
              #CreatingBetterDrivers
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Cada kilómetro,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">una decisión</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-[var(--brand-yellow)]"
                />
              </span>{" "}
              que premiar.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Resumen ejecutivo del desempeño de tus flotas. Selecciona una
              empresa para ver el ranking de conductores y profundizar en sus
              hábitos semana a semana.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
              <span>Powered by</span>
              <span className="font-display text-sm font-bold tracking-tight text-foreground">
                airbag<span className="text-[var(--brand-yellow)]">.</span>
              </span>
              <span>·</span>
              <span>
                {new Date().toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[var(--brand-yellow)]/40 blur-2xl" />
            <img
              src={heroIllustration}
              alt="Analítica de hábitos de conducción"
              className="w-full"
            />
          </div>
        </section>

        <section className="mb-14">
          <GlobalSummary />
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Empresas
            </h2>
            <span className="text-sm text-muted-foreground">
              Click para ver el detalle
            </span>
          </div>
          <CompanyOverview />
        </section>

        <section className="mb-4 grid gap-6 rounded-3xl border border-border/70 bg-secondary/40 p-8 sm:p-10 md:grid-cols-3">
          {[
            {
              img: conductorIllustration,
              title: "Maneja",
              body: "Detectamos eventos de riesgo y kilómetros recorridos en tiempo real.",
            },
            {
              img: acumulaIllustration,
              title: "Acumula",
              body: "Cada reto cumplido suma puntos según el presupuesto de tu flota.",
            },
            {
              img: calificaIllustration,
              title: "Premia",
              body: "Los mejores hábitos se traducen en recompensas semana a semana.",
            },
          ].map((step) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex h-40 items-center justify-center">
                <img
                  src={step.img}
                  alt={step.title}
                  className="h-full w-auto object-contain"
                />
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        airbag technologies · #CreatingBetterDrivers ·{" "}
        {new Date().getFullYear()}
      </footer>
    </div>
  );
}
