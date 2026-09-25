import { createFileRoute } from "@tanstack/react-router";
import { driveFetch, isArchiveFile } from "@/lib/archive/drive.server";

export const Route = createFileRoute("/api/media/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { fileId } = params;
        if (!/^[A-Za-z0-9_-]{10,}$/.test(fileId) || !(await isArchiveFile(fileId))) {
          return new Response("Not found", { status: 404 });
        }
        const url = new URL(request.url);
        const size = url.searchParams.get("size");
        const download = url.searchParams.get("download") === "1";

        const metaRes = await driveFetch(
          `/files/${fileId}?fields=name,mimeType,thumbnailLink&supportsAllDrives=true`,
        );
        if (!metaRes.ok) return new Response("Unavailable", { status: metaRes.status });
        const meta = (await metaRes.json()) as { name: string; mimeType: string; thumbnailLink?: string };

        if (size === "thumb") {
          if (meta.thumbnailLink) {
            const t = await fetch(meta.thumbnailLink.replace(/=s\d+$/, "=s800"));
            if (t.ok) {
              return new Response(t.body, {
                headers: {
                  "Content-Type": t.headers.get("Content-Type") ?? "image/jpeg",
                  "Cache-Control": "public, max-age=86400",
                },
              });
            }
          }
          if (!meta.mimeType.startsWith("image/")) return new Response("No thumbnail", { status: 404 });
        }

        const range = request.headers.get("Range");
        const res = await driveFetch(`/files/${fileId}?alt=media&supportsAllDrives=true`, {
          headers: range ? { Range: range } : {},
        });
        if (!res.ok && res.status !== 206) {
          const body = await res.text();
          console.error(`Drive media failed [${res.status}]: ${body}`);
          return new Response("Unavailable", { status: res.status });
        }
        const h = new Headers({
          "Content-Type": res.headers.get("Content-Type") ?? meta.mimeType,
          "Cache-Control": "private, max-age=3600",
          "Accept-Ranges": "bytes",
        });
        for (const k of ["Content-Length", "Content-Range"]) {
          const v = res.headers.get(k);
          if (v) h.set(k, v);
        }
        if (download) {
          h.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(meta.name)}`);
        }
        return new Response(res.body, { status: res.status, headers: h });
      },
    },
  },
});
