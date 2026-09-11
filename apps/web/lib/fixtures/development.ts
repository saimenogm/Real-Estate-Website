/**
 * Design fixtures. These exist so the interface can be built and reviewed
 * without a database — the API is the source of truth in every real route, but
 * a designer (or an agent) should not need Postgres running to judge type,
 * rhythm and colour. Shapes mirror the DTOs exactly, so a component that looks
 * right here looks right in production.
 *
 * Content is the same placeholder as the seed, and carries the same
 * TODO(content) markers.
 */
import type {
  DevelopmentDto,
  InventoryDto,
  MediaSetDto,
  StackFloorDto,
  StackUnitDto,
} from '../api';
import type { Orientation, UnitStatus } from '@avida/types';

function mediaSet(key: string, label: string, kind: string): MediaSetDto {
  const states = ['DAWN', 'DAY', 'DUSK', 'NIGHT'] as const;
  return {
    id: `set-${key}`,
    key,
    label,
    kind,
    assets: Object.fromEntries(
      states.map((t) => [
        t,
        {
          id: `${key}-${t}`,
          timeState: t,
          originalKey: `seed-media/${key}-${t.toLowerCase()}.svg`,
          width: 1600,
          height: 900,
          altText: `${label}, ${t.toLowerCase()}`,
          dominantHex: { DAWN: '#DCD8D2', DAY: '#E4E3DD', DUSK: '#2E3038', NIGHT: '#171B26' }[t],
        },
      ]),
    ),
  };
}

const TYPOLOGIES = [
  { slug: 'studio', name: 'Studio', bedrooms: 0, min: 41, max: 46, from: 8_900_000, ratio: 0.7, per: 2 },
  { slug: 'one-bed', name: 'One bedroom', bedrooms: 1, min: 63, max: 71, from: 13_500_000, ratio: 0.9, per: 3 },
  { slug: 'two-bed', name: 'Two bedroom', bedrooms: 2, min: 96, max: 108, from: 19_800_000, ratio: 1.15, per: 3 },
  { slug: 'two-bed-corner', name: 'Two bedroom corner', bedrooms: 2, min: 128, max: 142, from: 26_400_000, ratio: 1.45, per: 2 },
  { slug: 'penthouse', name: 'Penthouse', bedrooms: 3, min: 198, max: 214, from: 48_500_000, ratio: 2.6, per: 0 },
];

const ORIENTATIONS: Orientation[] = ['NW', 'W', 'W', 'SW', 'S', 'S', 'SE', 'E', 'NE', 'N'];
const LETTERS = 'ABCDEFGHIJ';

/** Sold from the bottom up, as buildings actually sell. */
function statusFor(index: number): UnitStatus {
  const order: UnitStatus[] = [
    ...Array<UnitStatus>(20).fill('SOLD'),
    ...Array<UnitStatus>(8).fill('BOOKED'),
    ...Array<UnitStatus>(12).fill('RESERVED'),
    ...Array<UnitStatus>(48).fill('AVAILABLE'),
    ...Array<UnitStatus>(4).fill('NOT_RELEASED'),
  ];
  return order[index] ?? 'AVAILABLE';
}

const floors: StackFloorDto[] = [];
let unitIndex = 0;

for (let level = 0; level <= 10; level++) {
  const isTop = level === 10;
  const label = level === 0 ? 'Ground' : isTop ? 'Penthouse' : `Floor ${level}`;
  const units: StackUnitDto[] = [];

  if (level > 0) {
    const slugs = isTop
      ? ['penthouse', 'penthouse']
      : TYPOLOGIES.flatMap((t) => Array.from({ length: t.per }, () => t.slug));

    slugs.forEach((slug, i) => {
      const t = TYPOLOGIES.find((x) => x.slug === slug)!;
      const premium = 1 + (level - 1) * 0.025;
      units.push({
        id: `u-${level}-${i}`,
        code: isTop ? `PH-${LETTERS[i]}` : `${level}${LETTERS[i]}`,
        status: statusFor(unitIndex++),
        priceMinor: Math.round((t.from * premium) / 1000) * 1000,
        currency: 'USD',
        areaSqm: Math.round((t.min + (t.max - t.min) * ((i * 37) % 10) / 10) * 10) / 10,
        orientation: isTop ? (i === 0 ? 'SW' : 'NE') : ORIENTATIONS[i]!,
        viewTags: ['valley', 'sunset'],
        positionIndex: i,
        widthRatio: t.ratio,
        typology: { slug: t.slug, name: t.name, bedrooms: t.bedrooms },
      });
    });
  }

  floors.push({ id: `f-${level}`, level, label, heightM: level * 3.2, units });
}

const allUnits = floors.flatMap((f) => f.units);
const available = allUnits.filter((u) => u.status === 'AVAILABLE');

const byStatus = allUnits.reduce<Record<string, number>>((acc, u) => {
  acc[u.status] = (acc[u.status] ?? 0) + 1;
  return acc;
}, {});

export const fixtureDevelopment: DevelopmentDto = {
  id: 'dev-1',
  slug: 'seed-dev',
  name: 'Kivu Ridge',
  tagline: 'Nine floors above the valley',
  descriptionMd: [
    'The site falls twelve metres from north to south. Rather than cut a flat platform, the building steps with the slope: three volumes, each half a floor above the last, joined by a covered street that runs the length of the site.',
    'Board-formed concrete carries the structure. Bronze anodised screening shades the west elevation, where the afternoon sun is hardest, and turns the facade from flat to deep as the day moves across it.',
    'Every apartment has a balcony deep enough to sit on, and every balcony faces either the valley or the hills. TODO(content)',
  ].join('\n\n'),
  city: 'Kigali',
  country: 'RW',
  currency: 'USD',
  handoverDate: '2027-09-30T00:00:00.000Z',
  latitude: -1.9403,
  longitude: 30.0915,
  typologies: TYPOLOGIES.map((t, i) => ({
    id: `t-${i}`,
    slug: t.slug,
    name: t.name,
    bedrooms: t.bedrooms,
    bathrooms: t.bedrooms === 0 ? 1 : t.bedrooms,
    areaSqmMin: t.min,
    areaSqmMax: t.max,
    descriptionMd: null,
    floorPlanSvgUrl: null,
    summary: {
      total: allUnits.filter((u) => u.typology.slug === t.slug).length,
      available: available.filter((u) => u.typology.slug === t.slug).length,
      priceMinorFrom:
        available.filter((u) => u.typology.slug === t.slug)[0]?.priceMinor ?? null,
    },
  })),
  amenities: [
    { id: 'a1', name: 'Roof terrace', descriptionMd: 'The tenth-floor terrace runs the full width of the block, open to residents from six in the morning.', iconKey: 'terrace' },
    { id: 'a2', name: 'Twenty-five metre pool', descriptionMd: 'Four lanes, heated year round, under the shade of the screening.', iconKey: 'pool' },
    { id: 'a3', name: 'The covered street', descriptionMd: 'The circulation spine is open at both ends, so it moves air as well as people.', iconKey: 'street' },
    { id: 'a4', name: 'Residents’ workroom', descriptionMd: 'Six desks and two rooms for calls, on the second floor. TODO(content)', iconKey: 'work' },
    { id: 'a5', name: 'Backup power and water', descriptionMd: 'Full-load generator and three days of stored water. TODO(content)', iconKey: 'power' },
    { id: 'a6', name: 'Secure parking', descriptionMd: 'One bay per apartment, two for the penthouses.', iconKey: 'parking' },
  ],
  landmarks: [
    { id: 'l1', name: 'Simba Supermarket Nyarutarama', category: 'SHOPPING', distanceM: 799, driveMinutes: 2, walkMinutes: 11 },
    { id: 'l2', name: 'Kigali Golf Club', category: 'LEISURE', distanceM: 1090, driveMinutes: 2, walkMinutes: 15 },
    { id: 'l3', name: 'US Embassy', category: 'EMBASSY', distanceM: 1304, driveMinutes: 3, walkMinutes: 17 },
    { id: 'l4', name: 'King Faisal Hospital', category: 'HOSPITAL', distanceM: 1401, driveMinutes: 3, walkMinutes: 19 },
    { id: 'l5', name: 'Kigali Convention Centre', category: 'BUSINESS', distanceM: 1464, driveMinutes: 3, walkMinutes: 20 },
    { id: 'l6', name: 'Green Hills Academy', category: 'SCHOOL', distanceM: 2180, driveMinutes: 5, walkMinutes: 29 },
    { id: 'l7', name: 'Kigali International Airport', category: 'AIRPORT', distanceM: 6120, driveMinutes: 13, walkMinutes: null },
  ],
  milestones: [
    { id: 'm1', sortOrder: 1, label: 'On reservation', percent: 5, triggerType: 'ON_RESERVATION', triggerDate: null, triggerNote: null },
    { id: 'm2', sortOrder: 2, label: 'On contract signing', percent: 15, triggerType: 'ON_SIGNING', triggerDate: null, triggerNote: null },
    { id: 'm3', sortOrder: 3, label: 'On completion of structure', percent: 20, triggerType: 'ON_CONSTRUCTION_STAGE', triggerDate: null, triggerNote: 'On completion of the roof slab' },
    { id: 'm4', sortOrder: 4, label: 'On completion of facade', percent: 20, triggerType: 'ON_DATE', triggerDate: '2027-03-01T00:00:00.000Z', triggerNote: null },
    { id: 'm5', sortOrder: 5, label: 'On completion of fit-out', percent: 20, triggerType: 'ON_CONSTRUCTION_STAGE', triggerDate: null, triggerNote: 'On completion of internal fit-out' },
    { id: 'm6', sortOrder: 6, label: 'On handover', percent: 20, triggerType: 'ON_HANDOVER', triggerDate: null, triggerNote: null },
  ],
  faqs: [
    { id: 'q1', question: 'When is handover?', answerMd: 'September 2027, with the payment schedule tied to construction stages rather than to dates alone. TODO(content)' },
    { id: 'q2', question: 'What is the reservation process?', answerMd: 'A five percent reservation fee holds an apartment for fourteen days while contracts are prepared. TODO(content)' },
    { id: 'q3', question: 'Can I buy as a non-resident?', answerMd: 'TODO(content)' },
    { id: 'q4', question: 'What is included in the finish?', answerMd: 'TODO(content)' },
  ],
  seo: null,
  mediaSets: [
    mediaSet('hero-exterior', 'Approach from the north', 'EXTERIOR'),
    mediaSet('aerial-context', 'The site in the city', 'AERIAL'),
    mediaSet('rooftop', 'Roof terrace', 'AMENITY'),
    mediaSet('lobby', 'Lobby and covered street', 'INTERIOR'),
  ],
  summary: {
    total: allUnits.length,
    byStatus,
    available: available.length,
    percentSold: Math.round((((byStatus.SOLD ?? 0) + (byStatus.BOOKED ?? 0)) / allUnits.length) * 100),
    priceMinorMin: Math.min(...available.map((u) => u.priceMinor)),
    priceMinorMax: Math.max(...available.map((u) => u.priceMinor)),
  },
};

export const fixtureInventory: InventoryDto = {
  slug: 'seed-dev',
  currency: 'USD',
  buildings: [{ id: 'b-1', name: 'Ridge Block', floorCount: 10, floors }],
  summary: fixtureDevelopment.summary,
  generatedAt: new Date('2026-09-11T09:00:00Z').toISOString(),
};
