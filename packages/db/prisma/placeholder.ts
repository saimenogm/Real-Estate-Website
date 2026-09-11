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

export function placeholderSvg(setKey: string, label: string, state: TimeStateKey): string {
  const p = PALETTES[state];
  const seed = hash(setKey);

  // A skyline of four to six blocks, stepped like the building the spec
  // describes rather than a random city.
  const blocks: string[] = [];
  const count = 4 + (seed % 3);
  let x = 120 + (seed % 90);
  for (let i = 0; i < count; i++) {
    const w = 190 + ((seed >> (i * 3)) % 160);
    const h = 230 + ((seed >> (i * 2)) % 300);
    const y = 720 - h;
    blocks.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.massing}"/>`);

    // Window grid — the only reason the four states read differently at a glance.
    const rows = Math.floor(h / 46);
    const cols = Math.floor(w / 44);
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = (seed >> ((r * cols + c) % 28)) & 1;
        if (state === 'DAY' || state === 'DAWN' || lit) {
          blocks.push(
            `<rect x="${x + 14 + c * 44}" y="${y + 12 + r * 46}" width="20" height="26" fill="${p.window}" opacity="${
              state === 'DAY' ? p.windowOpacity : lit ? p.windowOpacity : 0.12
            }"/>`,
          );
        }
      }
    }
    x += w + 26;
    if (x > 1400) break;
  }

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
