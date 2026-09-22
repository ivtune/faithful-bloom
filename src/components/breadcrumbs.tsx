import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/archive/types";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            ) : null}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                params={item.params}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast ? "font-medium text-foreground" : "text-muted-foreground"
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
