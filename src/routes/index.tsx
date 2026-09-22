import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { EventCard } from "@/components/event-card";
import {
  getCountriesForZone,
  getFeaturedMedia,
  getRecentEvents,
  getStats,
  getZonesForCategory,
} from "@/lib/archive/archive.service";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "EHC West Africa Media Archive",
      "Explore photos and videos from EHC Ministries and Margins across West Africa.",
    ),
  component: Index,
});

function Index() {
  const stats = getStats();
  const recentEvents = getRecentEvents(6);
  const featured = getFeaturedMedia(8);
  const zones = getZonesForCategory("ministries");

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt=""
          width={1600}
          height={900}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/25" />
        <div className="mx-auto flex min-h-[64vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-primary-foreground">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary-foreground/80">
              <span className="h-px w-10 bg-gold" />
              EHC West Africa
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Media Archive
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
              Explore photos and videos from EHC Ministries and Margins across West
              Africa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/browse/$category"
                params={{ category: "ministries" }}
                className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
              >
                Browse Ministries
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/browse/$category"
                params={{ category: "margins" }}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Browse Margins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Archive statistics */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-5 lg:px-8">
          {[
            { label: "Zones", value: stats.zones },
            { label: "Countries / Areas", value: stats.countries },
            { label: "Events", value: stats.events },
            { label: "Photos", value: stats.photos },
            { label: "Videos", value: stats.videos },
          ].map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-display text-4xl font-semibold text-primary">
                {stat.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent events */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground">
              Recent Events
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The latest additions to the archive.
            </p>
          </div>
          <Link
            to="/browse/$category"
            params={{ category: "ministries" }}
            className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Featured media */}
      <section className="bg-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Featured Media
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A glimpse of the archive. Open any image to visit its event.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featured.map((item) => (
              <Link
                key={item.id}
                to="/event/$eventId"
                params={{ eventId: item.event.id }}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-2 text-[11px] font-medium text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {item.event.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick access */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Quick Access
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            to="/browse/$category"
            params={{ category: "ministries" }}
            className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Ministries
              </h3>
              <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Photos and videos from EHC ministry work across the three zones.
            </p>
          </Link>
          <Link
            to="/browse/$category"
            params={{ category: "margins" }}
            className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Margins
              </h3>
              <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Photos and videos from EHC Margins outreach across the three zones.
            </p>
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {zones.map((zone) => (
            <Link
              key={zone.id}
              to="/browse/$category/$zone"
              params={{ category: "ministries", zone: zone.id }}
              className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {zone.name}
                </h3>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {getCountriesForZone("ministries", zone.id).length} countries / areas
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
