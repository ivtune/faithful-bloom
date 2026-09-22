import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { PhotoGallery } from "@/components/photo-gallery";
import { SelectionBar } from "@/components/selection-bar";
import { VideoGrid } from "@/components/video-grid";
import {
  getCategory,
  getEvent,
  getZoneName,
} from "@/lib/archive/archive.service";
import { downloadMedia } from "@/lib/download";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/event/$eventId")({
  head: () =>
    pageHead(
      "Event Media — EHC West Africa Media Archive",
      "View, select and download photos and videos from this event.",
    ),
  component: EventPage,
});

function EventPage() {
  const { eventId } = Route.useParams();
  const event = getEvent(eventId);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  if (!event) throw notFound();

  const categoryInfo = getCategory(event.categoryId);
  const zoneName = getZoneName(event.zoneId);

  const toggle = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedPhotos = event.photos.filter((photo) => selected.has(photo.id));
  const selectedVideos = event.videos.filter((video) => selected.has(video.id));
  const selectedCount = selectedPhotos.length + selectedVideos.length;

  const downloadSelected = async () => {
    const items = [
      ...selectedPhotos.map((photo) => ({
        url: photo.downloadReference,
        name: photo.name,
      })),
      ...selectedVideos.map((video) => ({
        url: video.downloadReference,
        name: video.name,
      })),
    ];
    for (const item of items) {
      await downloadMedia(item.url, item.name);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setSelected(new Set());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          {
            label: categoryInfo.name,
            to: "/browse/$category",
            params: { category: event.categoryId },
          },
          {
            label: zoneName,
            to: "/browse/$category/$zone",
            params: { category: event.categoryId, zone: event.zoneId },
          },
          {
            label: event.countryName,
            to: "/browse/$category/$zone/$country",
            params: {
              category: event.categoryId,
              zone: event.zoneId,
              country: event.countryId,
            },
          },
          {
            label: String(event.year),
            to: "/browse/$category/$zone/$country/$year",
            params: {
              category: event.categoryId,
              zone: event.zoneId,
              country: event.countryId,
              year: String(event.year),
            },
          },
          { label: event.name },
        ]}
      />

      <h1 className="mt-6 font-display text-4xl font-semibold text-foreground">
        {event.name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {event.countryName} · {categoryInfo.name} · {event.year}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Date
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {event.date ? format(new Date(event.date), "d MMMM yyyy") : "Not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Country / Area
          </dt>
          <dd className="mt-1 font-medium text-foreground">{event.countryName}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Category
          </dt>
          <dd className="mt-1 font-medium text-foreground">{categoryInfo.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Zone
          </dt>
          <dd className="mt-1 font-medium text-foreground">{zoneName}</dd>
        </div>
      </dl>

      {event.photos.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Photos{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({event.photos.length})
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setSelected(new Set(event.photos.map((photo) => photo.id)))}
              className="text-sm font-medium text-primary hover:underline"
            >
              Select all photos
            </button>
          </div>
          <div className="mt-4">
            <PhotoGallery photos={event.photos} selected={selected} onToggle={toggle} />
          </div>
        </section>
      ) : null}

      {event.videos.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Videos{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({event.videos.length})
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setSelected(new Set(event.videos.map((video) => video.id)))}
              className="text-sm font-medium text-primary hover:underline"
            >
              Select all videos
            </button>
          </div>
          <div className="mt-4">
            <VideoGrid videos={event.videos} selected={selected} onToggle={toggle} />
          </div>
        </section>
      ) : null}

      {event.photos.length === 0 && event.videos.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No media available yet." />
        </div>
      ) : null}

      <SelectionBar
        count={selectedCount}
        onDownload={downloadSelected}
        onClear={() => setSelected(new Set())}
      />
    </div>
  );
}
