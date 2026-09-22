import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/browse/ministries", label: "Ministries" },
  { to: "/browse/margins", label: "Margins" },
  { to: "/search", label: "Search" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-display text-sm font-semibold tracking-wide text-primary-foreground">
            EHC
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold text-foreground">
              EHC West Africa
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Media Archive
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                isActive(item.to)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
