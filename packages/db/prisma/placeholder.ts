/**
 * §4.6 — placeholder art, generated so the site is demonstrable before any
 * render exists.
 *
 * Two jobs, in tension: it must be unmistakably *not* a render, and it must not
 * sabotage a layout review. A near-white rectangle with the set name across the
 * middle fails the second — display type sits over the hero, and a pale busy
 * stand-in makes a correct design look broken.
 *
 * So: a tonal sky, a flat massing silhouette, and the label small in the
 * corner. It reads as "no image yet" at a glance and still behaves like a
 * photograph for the purposes of judging contrast and composition.
 */
export type TimeStateKey = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';

interface Palette {
  skyTop: string;
  skyBottom: string;
  massing: string;
  ground: string;
  ink: string;
  window: string;
  windowOpacity: number;
}

/** Tuned to the §2.3 tokens of the matching time state. */
const PALETTES: Record<TimeStateKey, Palette> = {
  DAWN: { skyTop: '#B9BEC6', skyBottom: '#E4DED4', massing: '#6E6B69', ground: '#57584F', ink: '#2B2A2C', window: '#D9B078', windowOpacity: 0.5 },
  DAY: { skyTop: '#AFBDC4', skyBottom: '#E9E7DF', massing: '#7C817A', ground: '#5C6356', ink: '#232B24', window: '#F0EDE4', windowOpacity: 0.25 },
  DUSK: { skyTop: '#3B4252', skyBottom: '#C98F4E', massing: '#2F333B', ground: '#23252B', ink: '#E9E5DC', window: '#E8B267', windowOpacity: 0.85 },
  NIGHT: { skyTop: '#101522', skyBottom: '#26304A', massing: '#141924', ground: '#0E111A', ink: '#DFDCD4', window: '#D9A566', windowOpacity: 0.9 },
};

/** Deterministic, so the same set always produces the same stand-in. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * The massing the placeholder draws, as plain data, so the beauty image and its
 * depth pass are generated from one source and cannot disagree.
 */
interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0 = far, 1 = near. Nearer blocks are drawn later and lower. */
  depth: number;
}

function massing(setKey: string): Block[] {
  const seed = hash(setKey);
  const blocks: Block[] = [];
  const count = 4 + (seed % 3);
  let x = 120 + (seed % 90);

  for (let i = 0; i < count; i++) {
    const w = 190 + ((seed >> (i * 3)) % 160);
    const h = 230 + ((seed >> (i * 2)) % 300);
    blocks.push({ x, y: 720 - h, w, h, depth: (i + 1) / (count + 1) });
    x += w + 26;
    if (x > 1400) break;
  }
  return blocks;
}

/**
 * §7.4 — a depth pass for the parallax hero.
 *
 * This is emitted, not inferred. DECISIONS D-22 forbids synthesising a depth
 * map for a real render, because a guessed one misrepresents the building's
 * geometry (§13). That rule is about photographs and CG renders whose geometry
 * we do not know. Here we drew the image ourselves ten lines ago, so the depth
 * is not a guess: it is the same numbers that produced the picture.
 *
 * When a real render arrives it brings its own Z-depth pass, or it gets none.
 */
export function placeholderDepthSvg(setKey: string): string {
  const blocks = massing(setKey);
  const rects = blocks
    .map((b) => {
      const v = Math.round(40 + b.depth * 150);
      return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="rgb(${v},${v},${v})"/>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#1A1A1A"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#far)"/>
  ${rects}
  <rect x="0" y="720" width="1600" height="180" fill="#F2F2F2"/>
</svg>`;
}

export function placeholderSvg(setKey: string, label: string, state: TimeStateKey): string {
  const p = PALETTES[state];
  const seed = hash(setKey);

  // Four to six blocks, stepped like the building the spec describes rather
  // than a random city. Shared with the depth pass so the two agree exactly.
  const parts: string[] = [];
  for (const b of massing(setKey)) {
    // Nearer blocks sit slightly darker, which is what reads as depth.
    parts.push(
      `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${p.massing}" opacity="${(0.72 + b.depth * 0.28).toFixed(2)}"/>`,
    );

    // Window grid — the main reason the four states read differently at a glance.
    const rows = Math.floor(b.h / 46);
    const cols = Math.floor(b.w / 44);
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = (seed >> ((r * cols + c) % 28)) & 1;
        if (state === 'DAY' || state === 'DAWN' || lit) {
          parts.push(
            `<rect x="${b.x + 14 + c * 44}" y="${b.y + 12 + r * 46}" width="20" height="26" fill="${p.window}" opacity="${
              state === 'DAY' ? p.windowOpacity : lit ? p.windowOpacity : 0.12
            }"/>`,
          );
        }
      }
    }
  }
  const blocks = parts;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="Placeholder for ${label}, ${state.toLowerCase()}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.skyTop}"/>
      <stop offset="100%" stop-color="${p.skyBottom}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  ${blocks.join('\n  ')}
  <rect x="0" y="720" width="1600" height="180" fill="${p.ground}"/>
  <g font-family="ui-sans-serif, system-ui, sans-serif" fill="${p.ink}" opacity="0.62">
    <text x="40" y="860" font-size="22">${label} — ${state.toLowerCase()}</text>
    <text x="40" y="884" font-size="17">Placeholder. No render supplied yet. TODO(content)</text>
  </g>
</svg>`;
}
