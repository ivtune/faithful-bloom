import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import {
  getCategory,
  getCountryArea,
  getYears,
  getYearTotals,
  getZonesForCategory,
  isValidCategory,
} from "@/lib/archive/archive.service";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/browse/$category/$zone/$country")({
  head: () =>
    pageHead(
      "Country Archive — EHC West Africa Media Archive",
      "Choose a year to explore its archived events.",
    ),
  component: BrowseCountry,
});

function BrowseCountry() {
  const { category, zone, country } = Route.useParams();
  if (!isValidCategory(category)) throw notFound();

  const categoryInfo = getCategory(category);
  const zoneInfo = getZonesForCategory(category).find((z) => z.id === zone);
  const countryInfo = getCountryArea(category, zone, country);
  if (!zoneInfo || !countryInfo) throw notFound();

  const years = getYears();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: categoryInfo.name, to: "/browse/$category", params: { category } },
          {
            label: zoneInfo.name,
            to: "/browse/$category/$zone",
            params: { category, zone },
          },
          { label: countryInfo.name },
        ]}
      />
      <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
        {countryInfo.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {categoryInfo.name} · {zoneInfo.name}
      </p>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Select a year
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year) => {
          const totals = getYearTotals(category, zone, country, year);
          return (
            <Link
              key={year}
              to="/browse/$category/$zone/$country/$year"
              params={{ category, zone, country, year: String(year) }}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-3xl font-semibold text-foreground">
                  {year}
                </p>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {totals.events} event{totals.events === 1 ? "" : "s"} · {totals.photos}{" "}
                photos · {totals.videos} videos
              </p>
            </Link>
          );
        })}
      </div>

      {years.every((year) => getYearTotals(category, zone, country, year).events === 0) ? (
        <div className="mt-10">
          <EmptyState title="No media available yet." />
        </div>
      ) : null}
    </div>
  );
}
