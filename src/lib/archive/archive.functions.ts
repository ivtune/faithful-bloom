import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import type { ArchiveSnapshot } from "./types";
import { getDriveSnapshot } from "./drive.server";

export const getArchiveSnapshot = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArchiveSnapshot> => {
    try {
      return await getDriveSnapshot();
    } catch (error) {
      // Never let a Drive/config failure take down every page (the root loader
      // depends on this). Log it and render the site with an empty archive.
      console.error("[archive] Drive snapshot failed:", error);
      return { countries: [], events: [], generatedAt: new Date().toISOString() };
    }
  },
);

export const archiveSnapshotQuery = queryOptions({
  queryKey: ["archive-snapshot"],
  queryFn: () => getArchiveSnapshot(),
  staleTime: 5 * 60 * 1000,
});
