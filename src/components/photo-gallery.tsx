import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { ArchivePhoto } from "@/lib/archive/types";
import { downloadMedia } from "@/lib/download";

interface PhotoGalleryProps {
  photos: ArchivePhoto[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export function PhotoGallery({ photos, selected, onToggle }: PhotoGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i + photos.length - 1) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, prev, next]);

  const active = index !== null ? photos[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => {
          const isSelected = selected.has(photo.id);
          return (
            <figure
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-muted"
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View ${photo.name}`}
                className="block aspect-[4/3] w-full cursor-zoom-in overflow-hidden"
              >
                <img
                  src={photo.thumbnail}
                  alt={photo.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </button>
              <button
                type="button"
                onClick={() => onToggle(photo.id)}
                aria-label={`Select ${photo.name}`}
                className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/70 bg-black/30 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                }`}
              >
                <Check className="h-4 w-4" />
              </button>
            </figure>
          );
        })}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-foreground/95" onClick={close}>
          <div className="flex items-center justify-between px-4 py-3 text-primary-foreground">
            <span className="text-sm">
              {(index ?? 0) + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadMedia(active.preview, active.name)}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/30 px-3 py-1.5 text-sm transition-colors hover:bg-primary-foreground/10"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close viewer"
                className="rounded-md p-2 transition-colors hover:bg-primary-foreground/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center px-4 pb-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 z-10 rounded-full bg-black/40 p-2.5 text-primary-foreground transition-colors hover:bg-black/60 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <img
              src={active.preview}
              alt={active.name}
              className="max-h-[75vh] max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 z-10 rounded-full bg-black/40 p-2.5 text-primary-foreground transition-colors hover:bg-black/60 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
