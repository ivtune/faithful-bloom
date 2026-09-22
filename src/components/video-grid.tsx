import { useState } from "react";
import { Check, Download, Play, X } from "lucide-react";
import type { ArchiveVideo } from "@/lib/archive/types";
import { downloadMedia } from "@/lib/download";

interface VideoGridProps {
  videos: ArchiveVideo[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export function VideoGrid({ videos, selected, onToggle }: VideoGridProps) {
  const [active, setActive] = useState<ArchiveVideo | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => {
          const isSelected = selected.has(video.id);
          return (
            <div
              key={video.id}
              className="group overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActive(video)}
                  aria-label={`Play ${video.name}`}
                  className="block aspect-video w-full overflow-hidden bg-muted"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5" />
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(video.id)}
                  aria-label={`Select ${video.name}`}
                  className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/70 bg-black/30 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-sm font-medium text-foreground" title={video.name}>
                  {video.name}
                </p>
                <button
                  type="button"
                  onClick={() => downloadMedia(video.downloadReference, video.name)}
                  aria-label={`Download ${video.name}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-foreground/95"
          onClick={() => setActive(null)}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-primary-foreground">
            <span className="truncate text-sm">{active.name}</span>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => downloadMedia(active.downloadReference, active.name)}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/30 px-3 py-1.5 text-sm transition-colors hover:bg-primary-foreground/10"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close player"
                className="rounded-md p-2 transition-colors hover:bg-primary-foreground/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            className="flex flex-1 items-center justify-center px-4 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <video
              key={active.id}
              src={active.src}
              controls
              autoPlay
              className="max-h-[75vh] w-full max-w-4xl rounded-lg bg-black"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
