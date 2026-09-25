import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { getDriveSnapshot } from "./drive.server";

export const getArchiveSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  return getDriveSnapshot();
});

export const archiveSnapshotQuery = queryOptions({
  queryKey: ["archive-snapshot"],
  queryFn: () => getArchiveSnapshot(),
  staleTime: 5 * 60 * 1000,
});
