export type CategoryId = "ministries" | "margins";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
}

export interface Zone {
  id: string;
  name: string;
  categoryId: CategoryId;
}

export interface CountryArea {
  id: string;
  name: string;
  zoneId: string;
  categoryId: CategoryId;
}

export interface EventSummary {
  id: string;
  name: string;
  /** ISO date string, "" when unknown */
  date: string;
  year: number;
  categoryId: CategoryId;
  zoneId: string;
  countryId: string;
  countryName: string;
  coverImage: string;
  photoCount: number;
  videoCount: number;
}

export interface ArchivePhoto {
  id: string;
  name: string;
  type: "photo";
  thumbnail: string;
  preview: string;
  downloadReference: string;
}

export interface ArchiveVideo {
  id: string;
  name: string;
  type: "video";
  thumbnail: string;
  src: string;
  downloadReference: string;
}

export interface EventDetail extends EventSummary {
  photos: ArchivePhoto[];
  videos: ArchiveVideo[];
}

export interface ArchiveStats {
  zones: number;
  countries: number;
  events: number;
  photos: number;
  videos: number;
}

export interface CategoryTotals {
  events: number;
  photos: number;
  videos: number;
}

export interface FeaturedMedia {
  id: string;
  name: string;
  thumbnail: string;
  event: EventSummary;
}

export interface SearchFilters {
  query?: string;
  categoryId?: CategoryId | "all";
  zoneId?: string | "all";
  countryId?: string | "all";
  year?: number | "all";
  mediaType?: "all" | "photos" | "videos";
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
  params?: Record<string, string>;
}
