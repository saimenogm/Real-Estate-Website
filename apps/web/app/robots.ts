import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // ?ui=single renders the same content as the canonical pages; letting a
      // crawler index both is duplicate content against ourselves.
      disallow: ['/*?ui='],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
