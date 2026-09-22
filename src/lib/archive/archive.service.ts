import {
  CATEGORIES,
  YEARS,
  getCountries,
  getCountryEvents,
  getZones,
  slugify,
} from "./mock-data";
import type {
  ArchiveStats,
  Category,
  CategoryId,
  CategoryTotals,
  CountryArea,
  EventDetail,
  EventSummary,
  FeaturedMedia,
  SearchFilters,
  Zone,
} from "./types";

/*
 * ARCHIVE DATA SERVICE
 *
 * This is the single interface between the UI and the archive data.
 * The UI never touches the mock data directly. When the private Google
 * Drive integration is added later, only this file changes — the UI,
 * routes and components stay exactly as they are.
 */

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function isValidCategory(value: string | undefined): value is CategoryId {
  return value === "ministries" || value === "margins";
}

export function getCategory(categoryId: CategoryId): Category {
  return CATEGORIES.find((category) => category.id === categoryId)!;
}

export function getZonesForCategory(categoryId: CategoryId): Zone[] {
  return getZones(categoryId);
}

export function getZoneName(zoneId: string): string {
  const zone = getZones("ministries").find((z) => z.id === zoneId);
  return zone ? zone.name : zoneId;
}

export function getCountriesForZone(categoryId: CategoryId, zoneId: string): CountryArea[] {
  return getCountries(categoryId).filter((country) => country.zoneId === zoneId);
}

export function getCountryArea(
  categoryId: CategoryId,
  zoneId: string,
  countryId: string,
): CountryArea | undefined {
  return getCountries(categoryId).find(
    (country) => country.zoneId === zoneId && country.id === countryId,
  );
}

export function getYears(): number[] {
  return YEARS;
}

function toSummary(event: EventDetail): EventSummary {
  return {
    id: event.id,
    name: event.name,
    date: event.date,
    year: event.year,
    categoryId: event.categoryId,
    zoneId: event.zoneId,
    countryId: event.countryId,
    countryName: event.countryName,
    coverImage: event.coverImage,
    photoCount: event.photoCount,
    videoCount: event.videoCount,
  };
}

export function getEvents(
  categoryId: CategoryId,
  zoneId: string,
  countryId: string,
  year: number,
): EventSummary[] {
  return getCountryEvents(categoryId, zoneId, countryId)
    .filter((event) => event.year === year)
    .map(toSummary);
}

export function getCountryTotals(
  categoryId: CategoryId,
  zoneId: string,
  countryId: string,
): CategoryTotals {
  const events = getCountryEvents(categoryId, zoneId, countryId);
  return {
    events: events.length,
    photos: events.reduce((sum, event) => sum + event.photoCount, 0),
    videos: events.reduce((sum, event) => sum + event.videoCount, 0),
  };
}

export function getYearTotals(
  categoryId: CategoryId,
  zoneId: string,
  countryId: string,
  year: number,
): CategoryTotals {
  const events = getCountryEvents(categoryId, zoneId, countryId).filter(
    (event) => event.year === year,
  );
  return {
    events: events.length,
    photos: events.reduce((sum, event) => sum + event.photoCount, 0),
    videos: events.reduce((sum, event) => sum + event.videoCount, 0),
  };
}

const eventIndex = new Map<string, EventDetail>();
let eventIndexBuilt = false;

function buildEventIndex(): void {
  if (eventIndexBuilt) return;
  for (const category of CATEGORIES) {
    for (const zone of getZones(category.id)) {
      for (const country of getCountries(category.id)) {
        if (country.zoneId !== zone.id) continue;
        for (const event of getCountryEvents(category.id, zone.id, country.id)) {
          eventIndex.set(event.id, event);
        }
      }
    }
  }
  eventIndexBuilt = true;
}

export function getEvent(eventId: string): EventDetail | undefined {
  buildEventIndex();
  return eventIndex.get(eventId);
}

function getAllEvents(): EventDetail[] {
  buildEventIndex();
  return [...eventIndex.values()];
}

export function getRecentEvents(limit: number): EventSummary[] {
  return getAllEvents()
    .map(toSummary)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getFeaturedMedia(limit: number): FeaturedMedia[] {
  const recent = getAllEvents()
    .filter((event) => event.photos.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const featured: FeaturedMedia[] = [];
  for (const event of recent) {
    if (featured.length >= limit) break;
    const photo = event.photos[0];
    featured.push({
      id: photo.id,
      name: photo.name,
      thumbnail: photo.thumbnail,
      event: toSummary(event),
    });
  }
  return featured;
}

export function getStats(): ArchiveStats {
  const events = getAllEvents();
  const zoneIds = new Set<string>();
  const countryIds = new Set<string>();
  let photos = 0;
  let videos = 0;

  for (const event of events) {
    zoneIds.add(event.zoneId);
    countryIds.add(event.countryId);
    photos += event.photoCount;
    videos += event.videoCount;
  }

  return {
    zones: zoneIds.size,
    countries: countryIds.size,
    events: events.length,
    photos,
    videos,
  };
}

export function searchEvents(filters: SearchFilters): EventSummary[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  let results = getAllEvents();

  if (filters.categoryId && filters.categoryId !== "all") {
    results = results.filter((event) => event.categoryId === filters.categoryId);
  }
  if (filters.zoneId && filters.zoneId !== "all") {
    results = results.filter((event) => event.zoneId === filters.zoneId);
  }
  if (filters.countryId && filters.countryId !== "all") {
    results = results.filter((event) => event.countryId === filters.countryId);
  }
  if (filters.year && filters.year !== "all") {
    results = results.filter((event) => event.year === filters.year);
  }
  if (filters.mediaType === "photos") {
    results = results.filter((event) => event.photoCount > 0);
  }
  if (filters.mediaType === "videos") {
    results = results.filter((event) => event.videoCount > 0);
  }

  if (query) {
    results = results.filter(
      (event) =>
        event.name.toLowerCase().includes(query) ||
        event.countryName.toLowerCase().includes(query) ||
        event.zoneId.includes(query) ||
        event.zoneId.replace(/-/g, " ").includes(query) ||
        event.photos.some((photo) => photo.name.toLowerCase().includes(query)) ||
        event.videos.some((video) => video.name.toLowerCase().includes(query)),
    );
  }

  return results.map(toSummary).sort((a, b) => b.date.localeCompare(a.date));
}

export { slugify };
