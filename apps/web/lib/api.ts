/**
 * Server-side API client. §6.7 — the build fails rather than shipping a page
 * with no inventory, but a revalidate-time failure serves the last good render.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const DEVELOPMENT_SLUG = process.env.NEXT_PUBLIC_DEVELOPMENT_SLUG ?? 'seed-dev';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function get<T>(path: string, revalidateSeconds = 3600): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed with ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

export interface MediaAssetDto {
  id: string;
  timeState: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
  originalKey: string;
  width: number;
  height: number;
  altText: string | null;
  dominantHex: string | null;
}

export interface MediaSetDto {
  id: string;
  key: string;
  label: string;
  kind: string;
  /** §6.2 — keyed by time state, so one state change resolves every image. */
  assets: Partial<Record<MediaAssetDto['timeState'], MediaAssetDto>>;
}

export interface DevelopmentDto {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  descriptionMd: string;
  city: string;
  country: string;
  currency: string;
  handoverDate: string | null;
  latitude: number;
  longitude: number;
  typologies: {
    id: string;
    slug: string;
    name: string;
    bedrooms: number;
    areaSqmMin: number;
    areaSqmMax: number;
  }[];
  amenities: { id: string; name: string; descriptionMd: string | null }[];
  landmarks: { id: string; name: string; category: string; distanceM: number | null; driveMinutes: number | null }[];
  milestones: { id: string; sortOrder: number; label: string; percent: number }[];
  mediaSets: MediaSetDto[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    available: number;
    percentSold: number;
    priceMinorMin: number | null;
    priceMinorMax: number | null;
  };
}

export function getDevelopment(slug: string = DEVELOPMENT_SLUG): Promise<DevelopmentDto> {
  return get<DevelopmentDto>(`/development/${slug}`);
}
