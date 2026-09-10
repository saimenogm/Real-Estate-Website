import type { DevelopmentDto, TypologyDto } from './api';

/**
 * §9 task 8 — structured data. Schema.org has no "off-plan development" type,
 * so the development is a Residence with an ItemList of offers and each
 * typology is an Accommodation. Only real, currently-available prices are
 * emitted: publishing a price for a sold unit is a misrepresentation (§13).
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function developmentJsonLd(dev: DevelopmentDto) {
  const available = dev.typologies.filter((t) => t.summary.priceMinorFrom !== null);
  return {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: dev.name,
    description: dev.tagline ?? undefined,
    url: SITE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: dev.city,
      addressCountry: dev.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: dev.latitude,
      longitude: dev.longitude,
    },
    numberOfAccommodationUnits: dev.summary.total,
    numberOfAvailableAccommodationUnits: dev.summary.available,
    makesOffer: available.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      url: `${SITE}/residences/${t.slug}`,
      priceCurrency: dev.currency,
      price: (t.summary.priceMinorFrom ?? 0) / 100,
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Accommodation',
        name: t.name,
        numberOfBedrooms: t.bedrooms,
        floorSize: { '@type': 'QuantitativeValue', value: t.areaSqmMin, unitCode: 'MTK' },
      },
    })),
  };
}

export function typologyJsonLd(typology: TypologyDto, dev: DevelopmentDto) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: typology.name,
    url: `${SITE}/residences/${typology.slug}`,
    numberOfBedrooms: typology.bedrooms,
    numberOfBathroomsTotal: typology.bathrooms,
    floorSize: { '@type': 'QuantitativeValue', value: typology.areaSqmMin, unitCode: 'MTK' },
    ...(typology.summary.priceMinorFrom !== null
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: dev.currency,
            price: typology.summary.priceMinorFrom / 100,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}
