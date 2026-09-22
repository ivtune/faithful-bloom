import type {
  ArchivePhoto,
  ArchiveVideo,
  Category,
  CategoryId,
  CountryArea,
  EventDetail,
  Zone,
} from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "ministries",
    name: "Ministries",
    description: "Photos and videos from EHC ministry work across the three zones.",
  },
  {
    id: "margins",
    name: "Margins",
    description: "Photos and videos from EHC Margins outreach across the three zones.",
  },
];

export const YEARS = [2026];

const ZONE_DEFS = [
  { id: "zone-1", name: "Zone 1" },
  { id: "zone-2", name: "Zone 2" },
  { id: "zone-3", name: "Zone 3" },
];

const COUNTRY_DEFS: Record<string, string[]> = {
  "zone-1": [
    "Nigeria North East",
    "Nigeria North West",
    "Nigeria South West",
    "Nigeria South East",
    "Ghana",
    "Benin",
  ],
  "zone-2": [
    "Burkina Faso",
    "Cape Verde",
    "Mali",
    "Guinea Conakry",
    "Côte d'Ivoire",
    "Cameroon",
    "Chad",
  ],
  "zone-3": [
    "DRC West",
    "DRC South",
    "DRC Central",
    "DRC East",
    "CAR",
    "Gabon",
    "Congo Republic",
    "Equatorial Guinea",
    "Liberia",
    "Sierra Leone",
    "São Tomé",
  ],
};

const EVENT_NAME_POOL = [
  "French Summer Class",
  "Kids B Mission",
  "Mission Outreach",
  "Evangelism Outreach",
  "Church Partnership",
  "Leadership Training",
  "Regional Programme",
  "Youth Conference",
  "Community Health Drive",
  "Scripture Distribution",
  "Pastors' Retreat",
  "Children's Ministry Day",
];

/**
 * Placeholder video clips used by the mock data only. When the Google Drive
 * integration arrives, these become signed, private streaming references.
 */
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getZones(categoryId: CategoryId): Zone[] {
  return ZONE_DEFS.map((zone) => ({ ...zone, categoryId }));
}

export function getCountries(categoryId: CategoryId): CountryArea[] {
  return ZONE_DEFS.flatMap((zone) =>
    COUNTRY_DEFS[zone.id].map((name) => ({
      id: slugify(name),
      name,
      zoneId: zone.id,
      categoryId,
    })),
  );
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const countryEventCache = new Map<string, EventDetail[]>();

/**
 * Deterministic mock events for one country/area under one category.
 * Generated on demand and cached, so the archive is never loaded all at once.
 */
export function getCountryEvents(
  categoryId: CategoryId,
  zoneId: string,
  countryId: string,
): EventDetail[] {
  const key = `${categoryId}/${zoneId}/${countryId}`;
  const cached = countryEventCache.get(key);
  if (cached) return cached;

  const zone = ZONE_DEFS.find((z) => z.id === zoneId);
  const countryName = zone
    ? COUNTRY_DEFS[zone.id].find((c) => slugify(c) === countryId)
    : undefined;

  if (!zone || !countryName) {
    countryEventCache.set(key, []);
    return [];
  }

  const rand = mulberry32(hashString(key));
  // A few countries intentionally have no events yet, to demonstrate empty states.
  const eventCount = rand() < 0.12 ? 0 : 2 + Math.floor(rand() * 4);

  const names = [...EVENT_NAME_POOL];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  const countrySlug = slugify(countryName);
  const events: EventDetail[] = [];

  for (let i = 0; i < eventCount; i++) {
    const name = names[i % names.length];
    const eventSlug = slugify(name);
    const id = `${categoryId}-${zoneId}-${countryId}-${eventSlug}`;
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const date = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    let photoCount = rand() < 0.12 ? 0 : 6 + Math.floor(rand() * 22);
    let videoCount = rand() < 0.3 ? 0 : 1 + Math.floor(rand() * 5);
    if (photoCount === 0 && videoCount === 0) photoCount = 8;

    const photos: ArchivePhoto[] = Array.from({ length: photoCount }, (_, p) => ({
      id: `${id}-photo-${p + 1}`,
      name: `${countrySlug}-${eventSlug}-photo-${String(p + 1).padStart(2, "0")}.jpg`,
      type: "photo" as const,
      thumbnail: `https://picsum.photos/seed/${id}-p${p + 1}/640/480`,
      preview: `https://picsum.photos/seed/${id}-p${p + 1}/1600/1200`,
      downloadReference: `https://picsum.photos/seed/${id}-p${p + 1}/1920/1440`,
    }));

    const videos: ArchiveVideo[] = Array.from({ length: videoCount }, (_, v) => ({
      id: `${id}-video-${v + 1}`,
      name: `${countrySlug}-${eventSlug}-clip-${String(v + 1).padStart(2, "0")}.mp4`,
      type: "video" as const,
      thumbnail: `https://picsum.photos/seed/${id}-v${v + 1}/800/450`,
      src: SAMPLE_VIDEOS[(hashString(id) + v) % SAMPLE_VIDEOS.length],
      downloadReference: SAMPLE_VIDEOS[(hashString(id) + v) % SAMPLE_VIDEOS.length],
    }));

    events.push({
      id,
      name,
      date,
      year: 2026,
      categoryId,
      zoneId,
      countryId,
      countryName,
      coverImage: `https://picsum.photos/seed/${id}-cover/960/640`,
      photoCount,
      videoCount,
      photos,
      videos,
    });
  }

  countryEventCache.set(key, events);
  return events;
}
