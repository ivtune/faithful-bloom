import type {
  ArchivePhoto,
  ArchiveSnapshot,
  ArchiveVideo,
  CategoryId,
  CountryArea,
  EventDetail,
} from "./types";
import { slugify } from "./slug";

/*
 * Google Drive provider (server-only).
 * Walks the organisation's archive folder and builds a snapshot:
 *   ROOT → MINISTRIES|MARGINS → ZONE n → Country → Year → (event folders | loose files)
 * Media is always served through /api/media/<id>; Drive URLs never reach the browser.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive/drive/v3";
export const ROOT_FOLDER_ID = "1xnU4PDbhHBWJhyK5Kuf6AOceqbsfrc-I";
const FOLDER = "application/vnd.google-apps.folder";
const CACHE_MS = 5 * 60 * 1000;

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  imageMediaMetadata?: { time?: string };
}

function headers(): Record<string, string> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const conn = process.env["GOOGLE_DRIVE_API_KEY"];
  if (!lovable || !conn) throw new Error("Google Drive connection is not configured");
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": conn };
}

export async function driveFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers as Record<string, string> | undefined) },
  });
}

async function listChildren(folderId: string): Promise<DriveFile[]> {
  const out: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken,files(id,name,mimeType,createdTime,imageMediaMetadata(time))",
      pageSize: "1000",
      orderBy: "name",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await driveFetch(`/files?${params}`);
    if (!res.ok) {
      const body = await res.text();
      console.error(`Drive list failed [${res.status}]: ${body}`);
      throw new Error(`Drive list failed [${res.status}]: ${body}`);
    }
    const json = (await res.json()) as { files: DriveFile[]; nextPageToken?: string };
    out.push(...json.files);
    pageToken = json.nextPageToken;
  } while (pageToken);
  return out;
}

const isFolder = (f: DriveFile) => f.mimeType === FOLDER;
const isImage = (f: DriveFile) => f.mimeType.startsWith("image/");
const isVideo = (f: DriveFile) => f.mimeType.startsWith("video/");

function categoryFromName(name: string): CategoryId | null {
  const n = name.trim().toLowerCase();
  if (n.startsWith("ministr")) return "ministries";
  if (n.startsWith("margin")) return "margins";
  return null;
}

function zoneFromName(name: string): { id: string; name: string } | null {
  const m = name.match(/zone\s*(\d+)/i);
  return m ? { id: `zone-${m[1]}`, name: `Zone ${m[1]}` } : null;
}

function yearFromName(name: string): number | null {
  const m = name.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

function titleCase(value: string): string {
  return value.replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

function media(id: string) {
  return {
    thumb: `/api/media/${id}?size=thumb`,
    full: `/api/media/${id}`,
    download: `/api/media/${id}?download=1`,
  };
}

function buildEvent(
  files: DriveFile[],
  meta: {
    name: string;
    slugKey: string;
    year: number;
    categoryId: CategoryId;
    zoneId: string;
    country: CountryArea;
    fallbackDate?: string;
  },
): EventDetail | null {
  const photos: ArchivePhoto[] = files.filter(isImage).map((f) => {
    const m = media(f.id);
    return { id: f.id, name: f.name, type: "photo", thumbnail: m.thumb, preview: m.full, downloadReference: m.download };
  });
  const videos: ArchiveVideo[] = files.filter(isVideo).map((f) => {
    const m = media(f.id);
    return { id: f.id, name: f.name, type: "video", thumbnail: m.thumb, src: m.full, downloadReference: m.download };
  });
  if (photos.length === 0 && videos.length === 0) return null;

  const dates = files
    .map((f) => f.imageMediaMetadata?.time?.replace(/^(\d{4}):(\d{2}):(\d{2}).*/, "$1-$2-$3") ?? f.createdTime)
    .filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}/.test(d))
    .map((d) => d.slice(0, 10))
    .sort();
  const date = dates[0] ?? meta.fallbackDate?.slice(0, 10) ?? "";

  return {
    id: `${meta.categoryId}-${meta.zoneId}-${meta.country.id}-${slugify(meta.slugKey)}`,
    name: meta.name,
    date,
    year: meta.year,
    categoryId: meta.categoryId,
    zoneId: meta.zoneId,
    countryId: meta.country.id,
    countryName: meta.country.name,
    coverImage: photos[0]?.thumbnail ?? videos[0]?.thumbnail ?? "",
    photoCount: photos.length,
    videoCount: videos.length,
    photos,
    videos,
  };
}

async function buildSnapshot(): Promise<ArchiveSnapshot> {
  const countries: CountryArea[] = [];
  const events: EventDetail[] = [];

  const categories = (await listChildren(ROOT_FOLDER_ID)).filter(isFolder);
  await Promise.all(
    categories.map(async (catFolder) => {
      const categoryId = categoryFromName(catFolder.name);
      if (!categoryId) return;
      const zones = (await listChildren(catFolder.id)).filter(isFolder);
      await Promise.all(
        zones.map(async (zoneFolder) => {
          const zone = zoneFromName(zoneFolder.name);
          if (!zone) return;
          const countryFolders = (await listChildren(zoneFolder.id)).filter(isFolder);
          await Promise.all(
            countryFolders.map(async (cf) => {
              const country: CountryArea = {
                id: slugify(cf.name),
                name: cf.name.trim(),
                zoneId: zone.id,
                categoryId,
              };
              countries.push(country);
              const yearFolders = (await listChildren(cf.id)).filter(isFolder);
              await Promise.all(
                yearFolders.map(async (yf) => {
                  const year = yearFromName(yf.name) ?? 2026;
                  const isPlainYear = /^\s*\d{4}\s*$/.test(yf.name);
                  const children = await listChildren(yf.id);
                  const loose = children.filter((c) => !isFolder(c));
                  const base = { year, categoryId, zoneId: zone.id, country };

                  if (loose.length) {
                    const name = isPlainYear
                      ? `${country.name} ${year}`
                      : titleCase(yf.name.trim());
                    const ev = buildEvent(loose, { ...base, name, slugKey: `${yf.name}`, fallbackDate: yf.createdTime });
                    if (ev) events.push(ev);
                  }
                  await Promise.all(
                    children.filter(isFolder).map(async (ef) => {
                      const files = (await listChildren(ef.id)).filter((f) => !isFolder(f));
                      const ev = buildEvent(files, {
                        ...base,
                        name: ef.name.trim(),
                        slugKey: `${year}-${ef.name}`,
                        fallbackDate: ef.createdTime,
                      });
                      if (ev) events.push(ev);
                    }),
                  );
                }),
              );
            }),
          );
        }),
      );
    }),
  );

  countries.sort((a, b) => a.zoneId.localeCompare(b.zoneId) || a.name.localeCompare(b.name));
  events.sort((a, b) => b.date.localeCompare(a.date));
  return { countries, events, generatedAt: new Date().toISOString() };
}

let cache: { at: number; data: ArchiveSnapshot } | null = null;
let inflight: Promise<ArchiveSnapshot> | null = null;

export async function getDriveSnapshot(): Promise<ArchiveSnapshot> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  if (!inflight) {
    inflight = buildSnapshot()
      .then((data) => {
        cache = { at: Date.now(), data };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  try {
    return await inflight;
  } catch (e) {
    if (cache) return cache.data; // serve stale on failure
    throw e;
  }
}

/** Only files that belong to the archive may be streamed. */
export async function isArchiveFile(fileId: string): Promise<boolean> {
  const snap = await getDriveSnapshot();
  return snap.events.some(
    (e) => e.photos.some((p) => p.id === fileId) || e.videos.some((v) => v.id === fileId),
  );
}
