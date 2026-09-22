import { createFileRoute, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import {
  getCategory,
  getCountryArea,
  getEvents,
  getYears,
  getZonesForCategory,
  isValidCategory,
} from "@/lib/archive/archive.service";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/browse/$category/$zone/$country/$year")({
  head: () =>
    pageHead(
      "Events — EHC West Africa Media Archive",
      "Browse the events archived for this country or area.",
    ),
  component: BrowseYear,
});

function BrowseYear() {
  const { category, zone, country, year } = Route.useParams();
  if (!isValidCategory(category)) throw notFound();

  const categoryInfo = getCategory(category);
  const zoneInfo = getZonesForCategory(category).find((z) => z.id === zone);
  const countryInfo = getCountryArea(category, zone, country);
  const parsedYear = Number(year);
  if (!zoneInfo || !countryInfo || !getYears().includes(parsedYear)) throw notFound();

  const events = getEvents(category, zone, country, parsedYear);

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
          {
            label: countryInfo.name,
            to: "/browse/$category/$zone/$country",
            params: { category, zone, country },
          },
          { label: String(parsedYear) },
        ]}
      />
      <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
        {countryInfo.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {parsedYear} · {events.length} event{events.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8">
        {events.length === 0 ? (
          <EmptyState title="No media available yet." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
