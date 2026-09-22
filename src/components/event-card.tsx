import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Images, Video } from "lucide-react";
import type { EventSummary } from "@/lib/archive/types";

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link
      to="/event/$eventId"
      params={{ eventId: event.id }}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={event.coverImage}
          alt={event.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur">
          {event.categoryId === "ministries" ? "Ministries" : "Margins"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
          {event.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.countryName}
          {event.date ? ` · ${format(new Date(event.date), "d MMM yyyy")}` : ""}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Images className="h-4 w-4 text-primary" />
            {event.photoCount} Photos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video className="h-4 w-4 text-primary" />
            {event.videoCount} Videos
          </span>
        </div>
      </div>
    </Link>
  );
}
