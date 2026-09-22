import { Download, X } from "lucide-react";

interface SelectionBarProps {
  count: number;
  onDownload: () => void;
  onClear: () => void;
}

export function SelectionBar({ count, onDownload, onClear }: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-xl ring-1 ring-primary-foreground/10">
        <span className="text-sm font-medium">
          {count} item{count === 1 ? "" : "s"} selected
        </span>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-gold-foreground transition-colors hover:bg-gold/90"
        >
          <Download className="h-4 w-4" />
          Download Selected
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="rounded-full p-1.5 transition-colors hover:bg-primary-foreground/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
