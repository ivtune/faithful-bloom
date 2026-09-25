import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import {
  getCategory,
  getCountriesForZone,
  getCountryTotals,
  getZonesForCategory,
  isValidCategory,
} from "@/lib/archive/archive.service";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/browse/$category/$zone/")({
  head: () =>
    pageHead(
      "Browse Countries — EHC West Africa Media Archive",
      "Choose a country or area to explore its archived events.",
    ),
  component: BrowseZone,
});

function BrowseZone() {
  const { category, zone } = Route.useParams();
  if (!isValidCategory(category)) throw notFound();

  const categoryInfo = getCategory(category);
  const zoneInfo = getZonesForCategory(category).find((z) => z.id === zone);
  if (!zoneInfo) throw notFound();

  const countries = getCountriesForZone(category, zone);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: categoryInfo.name, to: "/browse/$category", params: { category } },
          { label: zoneInfo.name },
        ]}
      />
      <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
        {zoneInfo.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {categoryInfo.name} · {countries.length} countries / areas
      </p>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Select a country / area
      </p>
      <div className="mt-4">
        {countries.length === 0 ? (
          <EmptyState title="No media available yet." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => {
              const totals = getCountryTotals(category, zone, country.id);
              return (
                <Link
                  key={country.id}
                  to="/browse/$category/$zone/$country"
                  params={{ category, zone, country: country.id }}
                  className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold leading-snug text-foreground">
                      {country.name}
                    </h2>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {totals.events} event{totals.events === 1 ? "" : "s"} ·{" "}
                    {totals.photos} photos · {totals.videos} videos
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
