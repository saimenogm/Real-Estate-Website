/**
 * Risk R5 — §6.5 demands 4.5:1 body contrast in all four time states, and §2.3
 * fixes the palette. Those two can conflict, and the usual discovery is an axe
 * failure in week 14. This test reads the real token file in Phase 0, so a bad
 * pair costs one edit instead of a redesign.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio, luminance, parseTokenStates } from './contrast';

const css = readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf8');
const states = parseTokenStates(css);
const STATES = ['dawn', 'day', 'dusk', 'night'];

describe('§2.3 colour tokens', () => {
  it('authors all four time states', () => {
    expect(Object.keys(states).sort()).toEqual([...STATES].sort());
  });

  it.each(STATES)('%s defines every token the others do', (state) => {
    const keys = Object.keys(states[state]!).sort();
    const dayKeys = Object.keys(states.day!).sort();
    expect(keys).toEqual(dayKeys);
  });
});

describe('§6.5 contrast floor — 4.5:1 for body text', () => {
  it.each(STATES)('%s: ink on surface', (state) => {
    const t = states[state]!;
    expect(contrastRatio(t['--ink']!, t['--surface']!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(STATES)('%s: ink on raised and sunk surfaces', (state) => {
    const t = states[state]!;
    expect(contrastRatio(t['--ink']!, t['--surface-raised']!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--ink']!, t['--surface-sunk']!)).toBeGreaterThanOrEqual(4.5);
  });

  // Muted ink carries secondary body copy — captions, meta, unit attributes —
  // so it is held to the same 4.5:1, not the 3:1 large-text allowance.
  it.each(STATES)('%s: muted ink on surface', (state) => {
    const t = states[state]!;
    expect(contrastRatio(t['--ink-muted']!, t['--surface']!)).toBeGreaterThanOrEqual(4.5);
  });
});

// Regression: the hero once used --surface for type over the scrim. That reads
// as white-on-dark by day and dark-on-dark at night, because --surface inverts
// between states while the scrim is always built from --ink. --on-scrim exists
// so the type has a ground-independent colour, and these assertions are what
// stop a future edit from quietly reintroducing the inversion.
describe('§6.5 contrast floor — type over the hero scrim', () => {
  it.each(STATES)('%s: on-scrim text against the scrim ground', (state) => {
    const t = states[state]!;
    // --scrim-ground, not --ink: --ink is light in the dark states, so a scrim
    // built from it would wash the image pale at night and put light type on a
    // light ground. The gradient bottoms out at 88% of this value.
    expect(contrastRatio(t['--on-scrim']!, t['--scrim-ground']!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(STATES)('%s: muted on-scrim text stays readable', (state) => {
    const t = states[state]!;
    expect(contrastRatio(t['--on-scrim-muted']!, t['--scrim-ground']!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(STATES)('%s: the scrim ground is dark and its type is light', (state) => {
    const t = states[state]!;
    expect(luminance(t['--scrim-ground']!)).toBeLessThan(0.05);
    // A light value has a high luminance; if a future edit set this to
    // --surface the dark states would fail here before anyone saw the page.
    expect(luminance(t['--on-scrim']!)).toBeGreaterThan(0.5);
  });
});

describe('§6.5 contrast floor — 3:1 for interface furniture', () => {
  // Focus rings, borders and status fills are non-text UI components: WCAG
  // 1.4.11 sets 3:1 for these, and the elevation stack depends on them reading
  // in every state.
  it.each(STATES)('%s: accent against surface', (state) => {
    const t = states[state]!;
    expect(contrastRatio(t['--accent']!, t['--surface']!)).toBeGreaterThanOrEqual(3);
  });

  // `--line` is a decorative hairline, which WCAG exempts — 1.4.11's 3:1 covers
  // components that convey meaning. It still has to be *visible*, so this is a
  // house floor of 1.3, not a standard. Anything a visitor must perceive to
  // understand state — a unit's status in the elevation stack, a focus ring —
  // uses --ink-muted or --accent, which are held to the real thresholds above.
  it.each(STATES)('%s: line is visible against surface', (state) => {
    const t = states[state]!;
    expect(contrastRatio(t['--line']!, t['--surface']!)).toBeGreaterThanOrEqual(1.3);
  });
});
