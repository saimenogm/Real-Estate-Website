import type { MediaAssetDto, MediaSetDto } from './api';
import { toTimeStateKey, type TimeState } from '@avida/types';

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? '';

export function mediaSrc(key: string): string {
  // Phase 0 placeholders are served from the app's own /public (DECISIONS D-07);
  // real assets come from R2 behind the CDN.
  if (!MEDIA_URL || key.startsWith('seed-media/')) return `/${key}`;
  return `${MEDIA_URL.replace(/\/$/, '')}/${key}`;
}

/**
 * §6.2 — resolve a set to the asset for the current time state, falling back to
 * DAY and then to whatever exists. A missing state must never render a broken
 * image; it logs and degrades.
 */
export function resolveAsset(set: MediaSetDto, state: TimeState): MediaAssetDto | null {
  const exact = set.assets[toTimeStateKey(state)];
  if (exact) return exact;

  const day = set.assets.DAY;
  if (day) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[media] set "${set.key}" has no ${state} asset; falling back to day`);
    }
    return day;
  }

  const any = Object.values(set.assets).find(Boolean);
  return any ?? null;
}
