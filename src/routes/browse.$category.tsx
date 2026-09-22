import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getCategory,
  getCountriesForZone,
  isValidCategory,
  getZonesForCategory,
} from "@/lib/archive/archive.service";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/browse/$category")({
  head: () =>
    pageHead(
      "Browse Zones — EHC West Africa Media Archive",
      "Choose a zone to explore archived media by country or area.",
    ),
  component: BrowseCategory,
});

function BrowseCategory() {
  const { category } = Route.useParams();
  if (!isValidCategory(category)) throw notFound();

  const categoryInfo = getCategory(category);
  const zones = getZonesForCategory(category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: categoryInfo.name }]} />
      <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
        {categoryInfo.name}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{categoryInfo.description}</p>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Select a zone
      </p>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {zones.map((zone) => {
          const countries = getCountriesForZone(category, zone.id);
          return (
            <Link
              key={zone.id}
              to="/browse/$category/$zone"
              params={{ category, zone: zone.id }}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {zone.name}
                </h2>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {countries.length} countries / areas
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {countries.slice(0, 4).map((country) => (
                  <li key={country.id}>{country.name}</li>
                ))}
                {countries.length > 4 ? (
                  <li className="font-medium text-primary">+ {countries.length - 4} more</li>
                ) : null}
              </ul>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
