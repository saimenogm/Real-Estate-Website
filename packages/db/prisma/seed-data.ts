/**
 * §4.6 seed fixtures. Everything here is PLACEHOLDER product data for a
 * development that does not exist, so the site is demonstrable before real
 * content arrives. §15 Q1 is unanswered — when the real development is
 * confirmed, this file is replaced, not edited around.
 *
 * Coordinates and landmark names are real (Kigali) so the PostGIS distance
 * calculations exercise real geometry rather than invented numbers.
 * Prices, unit codes, statuses and copy are fiction and marked TODO(content).
 */
import type {
  LandmarkCategory,
  MediaSetKind,
  MilestoneTrigger,
  Orientation,
  UnitStatus,
} from '../generated/client/client.js';

export const DEV_SLUG = 'seed-dev';

export const development = {
  slug: DEV_SLUG,
  name: 'Kivu Ridge', // TODO(content) — placeholder name
  tagline: 'Nine floors above the valley', // §2.7 voice
  descriptionMd: [
    '_TODO(content) — placeholder narrative, written to the §2.7 voice so the',
    'layout is legible. Replace with the architect’s own description._',
    '',
    'The site falls twelve metres from north to south. Rather than cut a flat',
    'platform, the building steps with the slope: three volumes, each half a',
    'floor above the last, joined by a covered street that runs the length of',
    'the site.',
    '',
    'Board-formed concrete carries the structure. Bronze anodised screening',
    'shades the west elevation, where the afternoon sun is hardest, and turns',
    'the facade from flat to deep as the day moves across it.',
  ].join('\n'),
  city: 'Kigali',
  country: 'RW',
  addressLine: 'KG 9 Ave, Nyarutarama', // TODO(content)
  latitude: -1.9403,
  longitude: 30.0915,
  handoverDate: new Date('2027-09-30T00:00:00Z'),
  currency: 'USD',
};

export const building = {
  name: 'Ridge Block',
  floorCount: 10,
  groundLabel: 'Ground',
};

export interface TypologySeed {
  slug: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  areaSqmMin: number;
  areaSqmMax: number;
  descriptionMd: string;
  /** how many of this typology sit on each standard floor */
  perFloor: number;
  basePriceMinor: number;
  widthRatio: number;
}

/** §4.6 — five typologies. Per-floor counts sum to 10 on floors 1–9. */
export const typologies: TypologySeed[] = [
  {
    slug: 'studio',
    name: 'Studio',
    bedrooms: 0,
    bathrooms: 1,
    areaSqmMin: 41,
    areaSqmMax: 46,
    descriptionMd: 'One room, a kitchen wall, and a balcony deep enough to sit on. TODO(content)',
    perFloor: 2,
    basePriceMinor: 8_900_000,
    widthRatio: 0.7,
  },
  {
    slug: 'one-bed',
    name: 'One bedroom',
    bedrooms: 1,
    bathrooms: 1,
    areaSqmMin: 63,
    areaSqmMax: 71,
    descriptionMd: 'A separated bedroom, a galley kitchen open to the living room. TODO(content)',
    perFloor: 3,
    basePriceMinor: 13_500_000,
    widthRatio: 0.9,
  },
  {
    slug: 'two-bed',
    name: 'Two bedroom',
    bedrooms: 2,
    bathrooms: 2,
    areaSqmMin: 96,
    areaSqmMax: 108,
    descriptionMd: 'Two bedrooms off a short hall, both with the valley on one side. TODO(content)',
    perFloor: 3,
    basePriceMinor: 19_800_000,
    widthRatio: 1.15,
  },
  {
    slug: 'two-bed-corner',
    name: 'Two bedroom corner',
    bedrooms: 2,
    bathrooms: 2,
    areaSqmMin: 128,
    areaSqmMax: 142,
    descriptionMd: 'The corner units turn, so the living room takes light from two sides. TODO(content)',
    perFloor: 2,
    basePriceMinor: 26_400_000,
    widthRatio: 1.45,
  },
  {
    slug: 'penthouse',
    name: 'Penthouse',
    bedrooms: 3,
    bathrooms: 3.5,
    areaSqmMin: 198,
    areaSqmMax: 214,
    descriptionMd: 'Two apartments on the tenth floor, each with the roof terrace above it. TODO(content)',
    perFloor: 0, // top floor only
    basePriceMinor: 48_500_000,
    widthRatio: 2.6,
  },
];

/** §4.6 — exact status distribution. Must sum to 92. */
export const statusDistribution: Record<UnitStatus, number> = {
  AVAILABLE: 48,
  RESERVED: 12,
  BOOKED: 8,
  SOLD: 20,
  NOT_RELEASED: 4,
};

/** Left-to-right around the plan; index matches positionIndex on the floor. */
export const orientations: Orientation[] = ['NW', 'W', 'W', 'SW', 'S', 'S', 'SE', 'E', 'NE', 'N'];

export const viewTagsByOrientation: Record<Orientation, string[]> = {
  N: ['city'],
  NE: ['city', 'hills'],
  E: ['hills'],
  SE: ['golf', 'hills'],
  S: ['golf', 'valley'],
  SW: ['valley', 'sunset'],
  W: ['valley', 'sunset'],
  NW: ['city', 'sunset'],
};

/** §4.6 — six milestones summing to exactly 100. */
export const milestones: {
  sortOrder: number;
  label: string;
  percent: number;
  triggerType: MilestoneTrigger;
  triggerDate?: Date;
  triggerNote?: string;
}[] = [
  { sortOrder: 1, label: 'On reservation', percent: 5, triggerType: 'ON_RESERVATION' },
  { sortOrder: 2, label: 'On contract signing', percent: 15, triggerType: 'ON_SIGNING' },
  {
    sortOrder: 3,
    label: 'On completion of structure',
    percent: 20,
    triggerType: 'ON_CONSTRUCTION_STAGE',
    triggerNote: 'On completion of the roof slab',
  },
  {
    sortOrder: 4,
    label: 'On completion of facade',
    percent: 20,
    triggerType: 'ON_DATE',
    triggerDate: new Date('2027-03-01T00:00:00Z'),
  },
  {
    sortOrder: 5,
    label: 'On completion of fit-out',
    percent: 20,
    triggerType: 'ON_CONSTRUCTION_STAGE',
    triggerNote: 'On completion of internal fit-out',
  },
  { sortOrder: 6, label: 'On handover', percent: 20, triggerType: 'ON_HANDOVER' },
];

export const amenities: { name: string; descriptionMd: string; iconKey: string }[] = [
  { name: 'Roof terrace', descriptionMd: 'The tenth-floor terrace runs the full width of the block. TODO(content)', iconKey: 'terrace' },
  { name: 'Twenty-five metre pool', descriptionMd: 'Four lanes, heated, open from six. TODO(content)', iconKey: 'pool' },
  { name: 'Gym', descriptionMd: 'TODO(content)', iconKey: 'gym' },
  { name: 'Covered street', descriptionMd: 'The circulation spine, open at both ends. TODO(content)', iconKey: 'street' },
  { name: 'Residents’ workroom', descriptionMd: 'TODO(content)', iconKey: 'work' },
  { name: 'Secure parking', descriptionMd: 'One bay per apartment, two for penthouses. TODO(content)', iconKey: 'parking' },
  { name: 'Backup power and water', descriptionMd: 'TODO(content)', iconKey: 'power' },
  { name: 'Concierge', descriptionMd: 'TODO(content)', iconKey: 'concierge' },
];

/** Real Kigali coordinates — distances are computed by PostGIS at seed time. */
export const landmarks: {
  name: string;
  category: LandmarkCategory;
  latitude: number;
  longitude: number;
}[] = [
  { name: 'Kigali Golf Club', category: 'LEISURE', latitude: -1.9349, longitude: 30.0997 },
  { name: 'Kigali Convention Centre', category: 'BUSINESS', latitude: -1.9535, longitude: 30.0925 },
  { name: 'Kigali Heights', category: 'SHOPPING', latitude: -1.9541, longitude: 30.0937 },
  { name: 'King Faisal Hospital', category: 'HOSPITAL', latitude: -1.9527, longitude: 30.0889 },
  { name: 'Green Hills Academy', category: 'SCHOOL', latitude: -1.9557, longitude: 30.1042 },
  { name: 'Kigali International Airport', category: 'AIRPORT', latitude: -1.9686, longitude: 30.1395 },
  { name: 'Kigali Business Centre', category: 'BUSINESS', latitude: -1.9441, longitude: 30.0619 },
  { name: 'Simba Supermarket Nyarutarama', category: 'SHOPPING', latitude: -1.9377, longitude: 30.0982 },
  { name: 'US Embassy', category: 'EMBASSY', latitude: -1.9520, longitude: 30.0930 },
  { name: 'Car Free Zone', category: 'LEISURE', latitude: -1.9445, longitude: 30.0588 },
];

/** §4.6 — four media sets × four time states = sixteen placeholder assets. */
export const mediaSets: {
  key: string;
  label: string;
  kind: MediaSetKind;
  cameraNote: string;
  sortOrder: number;
}[] = [
  { key: 'hero-exterior', label: 'Approach from the north', kind: 'EXTERIOR', cameraNote: '35mm equivalent, eye height, 40m from the north-west corner (§7.1)', sortOrder: 1 },
  { key: 'aerial-context', label: 'The site in the city', kind: 'AERIAL', cameraNote: '120m altitude, 20° down tilt, looking south-east (§7.1)', sortOrder: 2 },
  { key: 'rooftop', label: 'Roof terrace', kind: 'AMENITY', cameraNote: 'Dusk is the money shot here (§7.1)', sortOrder: 3 },
  { key: 'lobby', label: 'Lobby and covered street', kind: 'INTERIOR', cameraNote: '24mm, from the north entrance (§7.1)', sortOrder: 4 },
];

export const faqs: { question: string; answerMd: string }[] = [
  { question: 'When is handover?', answerMd: 'TODO(content) — the seed says September 2027.' },
  { question: 'What is the reservation process?', answerMd: 'TODO(content)' },
  { question: 'Can I buy as a non-resident?', answerMd: 'TODO(content)' },
  { question: 'What is included in the finish?', answerMd: 'TODO(content)' },
  { question: 'Is parking included?', answerMd: 'TODO(content)' },
  { question: 'What are the service charges?', answerMd: 'TODO(content)' },
];

/** Scene keys per tour — a connected graph, five scenes each (§4.6). */
export const tourScenes = [
  { key: 'entry', label: 'Entry', yawDeg: 0, planX: 120, planY: 700 },
  { key: 'living', label: 'Living room', yawDeg: 45, planX: 380, planY: 520 },
  { key: 'kitchen', label: 'Kitchen', yawDeg: 120, planX: 680, planY: 480 },
  { key: 'bedroom', label: 'Main bedroom', yawDeg: 200, planX: 880, planY: 300 },
  { key: 'balcony', label: 'Balcony', yawDeg: 270, planX: 420, planY: 160 },
];
