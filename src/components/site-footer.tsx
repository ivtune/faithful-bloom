import { Link } from "@tanstack/react-router";

interface FooterLink {
  label: string;
  to: string;
  params?: Record<string, string>;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: "Home", to: "/" },
  { label: "Ministries", to: "/browse/$category", params: { category: "ministries" } },
  { label: "Margins", to: "/browse/$category", params: { category: "margins" } },
  { label: "Search", to: "/search" },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-display text-xl font-semibold">EHC West Africa</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-primary-foreground/70">
              Media Archive
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
              An internal media library for EHC Ministries and Margins across West
              Africa.
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 text-sm">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                params={link.params ?? {}}
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} EHC West Africa. All media is for authorized
          internal use.
        </div>
      </div>
    </footer>
  );
}
