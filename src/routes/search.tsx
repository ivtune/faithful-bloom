import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import {
  getCountriesForZone,
  getYears,
  getZonesForCategory,
  searchEvents,
} from "@/lib/archive/archive.service";
import type { CategoryId } from "@/lib/archive/types";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/search")({
  head: () =>
    pageHead(
      "Search — EHC West Africa Media Archive",
      "Search the archive by event, country, zone or media file name.",
    ),
  component: SearchPage,
});

const inputClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const selectClass = `${inputClass} w-full appearance-none pr-8 sm:w-auto`;

function SearchPage() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<"all" | CategoryId>("all");
  const [zoneId, setZoneId] = useState("all");
  const [countryId, setCountryId] = useState("all");
  const [year, setYear] = useState("all");
  const [mediaType, setMediaType] = useState<"all" | "photos" | "videos">("all");

  const zones = getZonesForCategory("ministries");
  const countries =
    zoneId !== "all"
      ? getCountriesForZone("ministries", zoneId)
      : zones.flatMap((zone) => getCountriesForZone("ministries", zone.id));

  const results = searchEvents({
    query,
    categoryId,
    zoneId,
    countryId,
    year: year === "all" ? "all" : Number(year),
    mediaType,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold text-foreground">
        Search the Archive
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Search by event name, country / area, zone or photo and video file name.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card px-4">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try “French Summer Class” or “Ghana”…"
          className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          aria-label="Category"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value as "all" | CategoryId);
            setCountryId("all");
          }}
          className={selectClass}
        >
          <option value="all">All categories</option>
          <option value="ministries">Ministries</option>
          <option value="margins">Margins</option>
        </select>
        <select
          aria-label="Zone"
          value={zoneId}
          onChange={(event) => {
            setZoneId(event.target.value);
            setCountryId("all");
          }}
          className={selectClass}
        >
          <option value="all">All zones</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Country or area"
          value={countryId}
          onChange={(event) => setCountryId(event.target.value)}
          className={selectClass}
        >
          <option value="all">All countries / areas</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className={selectClass}
        >
          <option value="all">All years</option>
          {getYears().map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
        <select
          aria-label="Media type"
          value={mediaType}
          onChange={(event) =>
            setMediaType(event.target.value as "all" | "photos" | "videos")
          }
          className={selectClass}
        >
          <option value="all">Photos & videos</option>
          <option value="photos">Photos</option>
          <option value="videos">Videos</option>
        </select>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {results.length} event{results.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-4">
        {results.length === 0 ? (
          <EmptyState
            title="No events match your search."
            description="Try a different keyword or loosen the filters above."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
