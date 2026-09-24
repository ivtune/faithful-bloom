import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getCategory,
  getCountriesForZone,
  getCountryTotals,
  isValidCategory,
  getZonesForCategory,
} from "@/lib/archive/archive.service";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/browse/$category")({
  head: ({ params }) => {
    const categoryName = params.category === "margins" ? "Margins" : "Ministries";
    return pageHead(
      `${categoryName} Archive — EHC West Africa`,
      `Browse the EHC West Africa ${categoryName} archive by regional zone and country or area.`,
    );
  },
  component: BrowseCategory,
});

function BrowseCategory() {
  const { category } = Route.useParams();
  if (!isValidCategory(category)) throw notFound();

  const categoryInfo = getCategory(category);
  const zones = getZonesForCategory(category);
  const countries = zones.flatMap((zone) => getCountriesForZone(category, zone.id));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: `${categoryInfo.name} Directory` }]}
      />

      <header className="mt-6 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {categoryInfo.name} archive
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-foreground sm:text-5xl">
          {categoryInfo.name} Archive
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Select a zone or browse {categoryInfo.name.toLowerCase()} countries and areas
          below.
        </p>
      </header>

      <section aria-labelledby="zones-heading" className="py-9">
        <h2
          id="zones-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Regional zones
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
        {zones.map((zone) => {
          const zoneCountries = getCountriesForZone(category, zone.id);
          return (
            <Link
              key={zone.id}
              to="/browse/$category/$zone"
              params={{ category, zone: zone.id }}
              className="group border border-border bg-card p-6 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Regional zone
              </p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-semibold uppercase text-foreground">
                  {zone.name}
                </h3>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {zoneCountries.length} countries / areas
              </p>
            </Link>
          );
        })}
        </div>
      </section>

      <section aria-labelledby="countries-heading" className="pb-8 pt-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Country directory
            </p>
            <h2
              id="countries-heading"
              className="mt-2 font-display text-3xl font-semibold text-foreground"
            >
              All {categoryInfo.name} Countries
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {countries.length} countries / areas
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {countries.map((country) => {
            const zone = zones.find((item) => item.id === country.zoneId);
            const totals = getCountryTotals(category, country.zoneId, country.id);

            return (
              <Link
                key={`${country.zoneId}-${country.id}`}
                to="/browse/$category/$zone/$country"
                params={{ category, zone: country.zoneId, country: country.id }}
                className="group flex min-h-32 flex-col justify-between border border-border bg-card p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
                    {zone?.name ?? country.zoneId}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                    {country.name}
                  </h3>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FolderOpen className="h-3.5 w-3.5 text-primary" />
                    {totals.events} {totals.events === 1 ? "event folder" : "event folders"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
