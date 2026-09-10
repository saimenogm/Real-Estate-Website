import type { MetadataRoute } from 'next';
import { getTypologies } from '../lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** §6.1 — multi-page mode is the SEO default, so the sitemap lists its routes. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const typologies = await getTypologies().catch(() => []);
  const now = new Date();

  return [
    { url: SITE, lastModified: now, priority: 1 },
    { url: `${SITE}/residences`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/availability`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/location`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/enquire`, lastModified: now, priority: 0.6 },
    ...typologies.map((t) => ({
      url: `${SITE}/residences/${t.slug}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}
