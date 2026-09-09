# Build prompt — hand this to a coding agent

Two ways to use this. **Option A** is what you want if the agent can read files (Claude Code, Cursor, an agent with a repo). **Option B** is a self-contained prompt for a chat-only agent.

---

## Option A — with the spec file (recommended)

Put `IMPLEMENTATION_PLAN.md` in the repo root and send this:

> You are building a production luxury real estate website for a single pre-construction residential development. The complete specification is in `IMPLEMENTATION_PLAN.md` at the repo root.
>
> Read the entire specification before writing any code. Sections 2 (Design direction) and 7 (Visual asset production) contain constraints that affect every other section — Section 2 is binding, not advisory.
>
> Then:
>
> 1. Write `docs/DECISIONS.md` recording every choice the spec leaves open, with your reasoning.
> 2. Build Phase 0 exactly as specified in Section 9. Stop when its acceptance criteria pass and show me the evidence.
> 3. Wait for my go-ahead before starting Phase 1.
>
> Rules for the whole build:
> - Follow the phase order in Section 9. Do not work ahead.
> - Meet the acceptance criteria for each phase before moving on, and demonstrate them rather than asserting them.
> - Never invent product content — prices, unit data, copy. Use the seed fixtures in Section 4.6 and leave `TODO(content)` markers where real content is needed.
> - The design constraints in Section 2.1 are a rejection list. If you find yourself reaching for a black-and-gold palette, Playfair Display, or ALL-CAPS eyebrow labels, you have gone wrong.
> - TypeScript strict everywhere. No `any` without a comment explaining why.
> - Write the test alongside the code, not after.
> - When something in the spec is ambiguous or looks wrong, ask instead of guessing.
>
> Start by reading the spec and giving me a one-page summary of what you understood, plus any questions, before you write code.

---

## Option B — self-contained (chat-only agent)

Copy everything below the line.

---

Build a production-grade website for a single luxury pre-construction residential development. This is a sales instrument for one building with a fixed inventory of 92 units across 10 floors — not a property marketplace, not a listings portal. There are no public user accounts.

### Stack

Turborepo + pnpm. `apps/web` Next.js 15 App Router + TypeScript strict + Tailwind v4. `apps/api` NestJS 10 + Prisma 5 + PostgreSQL 16 with PostGIS. `apps/worker` BullMQ + Redis for media processing. `apps/admin` Refine. Media on Cloudflare R2 behind Cloudflare CDN. three.js + @react-three/fiber for 3D. @photo-sphere-viewer/core v5 for panoramas. sharp for images, ffmpeg for video.

### Design direction — this part is binding

The default output for "luxury real estate website" is a cliché. These are forbidden:

- Black or near-black backgrounds with gold accents
- Playfair Display, Cormorant Garamond, or Didot
- Cream backgrounds near #F4F1EA with terracotta accents near #D97757
- ALL-CAPS tracked-out eyebrow labels above headings
- Meta strings joined with middle dots (`3 Bed · 142m² · Floor 8`)
- `→` appended to button text
- Monospace faces for data labels
- Identical rounded cards with the same soft grey shadow for every content type
- Numbered markers (01/02/03) on content that isn't a sequence
- Fade-and-slide-up animation on every section entrance
- Copy like "Elevate your lifestyle" or "Where luxury meets"

**The concept instead: the palette is bound to time of day.** The site has four time states — dawn, day, dusk, night — and moving a scrubber transitions the background, type colour, accent, and every image on the page together over 1.2 seconds. This is the single bold move. Everything else stays quiet and disciplined.

Colour comes from the building's materials, not a luxury mood board: board-formed concrete, anodised bronze, dark timber screening, and the green of the surrounding hills.

```css
[data-time="day"]   { --surface:#E4E3DD; --ink:#232B24; --accent:#8C6A45; --line:#C2C1B8; }
[data-time="dawn"]  { --surface:#DCD8D2; --ink:#2B2A2C; --accent:#A0764C; --line:#BFB9B1; }
[data-time="dusk"]  { --surface:#2E3038; --ink:#E9E5DC; --accent:#C98F4E; --line:#4A4D57; }
[data-time="night"] { --surface:#171B26; --ink:#DFDCD4; --accent:#D9A566; --line:#2C3242; }
```

Set `data-time` on `<html>`; every colour cascades from there. No component computes a colour from the time state.

**Typography:** Gambetta (variable serif, from Fontshare) for display, Supreme (variable sans, Fontshare) for interface. Self-host as woff2 — no Google Fonts CDN. Major-third scale, 17px base. All numeric data uses `font-variant-numeric: tabular-nums`. Sentence case everywhere; no `text-transform: uppercase` anywhere in the codebase.

**Signature layout device:** render the unit inventory as an architectural **section elevation** — floors stacked vertically as they exist in the building, ground floor at the bottom, each floor a row of units drawn to relative width. Build it in SVG, not divs. Status is shown by fill treatment (solid / 45° hatch / outline) as well as hue, so it survives colour-blindness and all four time states. Every unit is a keyboard-focusable `<g role="button">` with a full `aria-label`.

**Motion:** one orchestrated moment — the time transition. Everything else responds only to user action. No scroll-triggered fade-ups, no auto-playing carousels, no counting-up numbers. Honour `prefers-reduced-motion` by snapping the time change instantly and disabling all scroll-driven sequences.

**Voice:** write like an architect, not a brochure. "Nine floors above the valley," not "Elevate your living experience." "Request a viewing," not "Submit Enquiry →." Specific beats evocative.

### Data model

Prisma with PostGIS. Core entities:

`Development → Building → Floor → Unit`, with `Unit` carrying code, status (`AVAILABLE | RESERVED | BOOKED | SOLD | NOT_RELEASED`), `priceMinor` (integer cents — never Float), `areaSqm`, `orientation`, `viewTags[]`, `positionIndex`, `widthRatio`, and `meshName` for the 3D model.

`Typology` holds the floor plan, bedrooms, area range, and links to a tour.

**The critical shape:** `MediaSet` is a *view*, `MediaAsset` is that view *at a time state*. `Scene` is a tour camera position, `PanoramaAsset` is that position *at a time state*. This is what makes the time system work — changing one piece of client state resolves every image on the page to a different asset with no bespoke wiring.

Also: `Tour → Scene → Hotspot`, `PaymentMilestone`, `Landmark` (with PostGIS-computed distances), `Enquiry` + `EnquiryUnit`, `VideoAsset` + `VideoChapter`, `FrameSequence`, `ProgressUpdate`, `UnitStatusLog`, `MediaJob`, `AdminUser`.

Store all money as integer minor units. Never persist derived values — unit counts, price ranges and percent-sold are computed at query time.

### Features to build

1. **Marketing site** — hero, narrative, residences, amenities, location with map and real distances, developer track record, FAQ.
2. **Live unit inventory** — the elevation stack, filters by typology / price / status / orientation, unit detail panel. Non-matching units drop to 30% opacity rather than disappearing; seeing the building is 78% sold is itself persuasive.
3. **Enquiry capture** — Turnstile-protected form, phone normalised to E.164, WhatsApp deep link with the unit pre-filled, UTM and referrer captured, email to the sales team.
4. **Payment schedule calculator** — pure tested function; rounding residue goes to the final row so the sum equals the price exactly.
5. **Admin panel** — sales team flips unit status, edits prices, reads enquiries, exports CSV. Status changes appear on the public site within 60 seconds without a deploy.
6. **Media pipeline** — presigned R2 upload, then automatic AVIF/WebP variants at 6 widths, thumbhash, depth map, panorama tiling, HLS video ladders. Admin board flags any media set missing a time state in red.
7. **Time-of-day system** — the scrubber, the four states, an optional auto-cycling timelapse mode, and coordinated crossfade of every image. Initial state derived from the visitor's local clock.
8. **Depth parallax hero** — Depth Anything V2 (or a Blender Z-depth pass) driving a WebGL displacement shader. Max displacement 0.035 NDC or edges tear.
9. **360° virtual tour** — Photo Sphere Viewer, node graph driven from the API so adding a scene needs no deploy. Panoramas follow the global time state; switching from day to night preserves camera direction.
10. **Interactive SVG floor plans** — semantic room paths, click a room to enter the tour at that scene, minimap with a rotating camera cone.
11. **Scroll-driven interactive video** — a 120-frame building orbit as an AVIF frame ladder, not a `<video>` element (frame-accurate scrubbing is unreliable in Safari). Preload frame 0, then every 8th, then fill in. Hotspot overlay maps frame ranges to units so a visitor can click a unit on the spinning building.
12. **Per-listing interactive video** — a 90-frame orbit of a cutaway model per typology, hotspots linking to tour scenes.
13. **Walkthrough video** — one continuous 60–90s camera path through a typology with chapter markers. **Each chapter links to the matching tour scene**, so stopping in the kitchen and pressing "Explore this room" opens the 360° tour at that spot. The link is the feature.
14. **3D building selector** — decimated glTF (≤80k tris, ≤5MB, Draco + KTX2), each unit a separately named mesh, lightmaps baked per time state and swapped rather than moving real lights.
15. **Sun and view simulator** — `suncalc` for real solar position by date and time from the development's actual coordinates, driving the lighting, with a compass and named landmarks on the horizon. Label it as modelled, never as a promise.
16. **Dual UI mode** — the site must ship both a single-page and a multi-page experience over the same components. Two Next.js route groups, `(single)` and `(multi)`, sharing a section registry. Mode resolves from `?ui=` param, then a cookie, then an env default, rewritten in middleware so the URL stays clean. Multi-page is the SEO default.

### 3D layering and fallbacks

Each 3D feature degrades independently. Probe capability once at mount (`webgl2`, `deviceMemory`, `saveData`, `effectiveType`, `prefers-reduced-motion`); enable heavy 3D only on webgl2 + ≥4GB + no save-data + 4g. Fallbacks: parallax → static image; tour → flat gallery; frame sequence → poster plus MP4; building selector → the SVG elevation stack; splats → the tour.

Everything WebGL is `dynamic(..., { ssr: false })` and below the fold. Nothing 3D blocks first paint.

### Performance budgets

Tested on a mid-range Android over throttled 4G: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.05, route JS ≤ 180KB gzip, hero AVIF ≤ 180KB, total first paint ≤ 900KB, frame sequence mobile ladder ≤ 2.5MB, panorama first view ≤ 400KB.

### Accessibility floor

Contrast ≥ 4.5:1 in **all four** time states (dusk is the one that will fail if you're careless). Visible focus rings. Keyboard navigation through the elevation stack and the panorama tour, with a text alternative listing rooms. `prefers-reduced-motion` honoured throughout. Tested in CI with `@axe-core/playwright` on every route in every time state.

### Legal constraints

This sells property that does not exist yet. **Never use generative AI to produce imagery representing a specific unit** — generative models invent architecture, and a hallucinated window is a misrepresentation. Generative tools are for atmosphere, context and furniture props only; anything dimensional comes from the architect's model. Display a persistent, readable disclaimer wherever CG imagery appears: "Computer-generated image. Final finishes, layout and views subject to change." Not buried in the footer.

### Build order

**Phase 0 (week 1)** — Monorepo, Docker compose (Postgres+PostGIS, Redis, MinIO), full Prisma schema, idempotent seed with 92 units across 5 typologies, NestJS health endpoints, Next.js with tokens and fonts wired, CI.
*Done when:* all apps start, the API returns a populated development, and the page visibly changes across all four `data-time` values.

**Phase 1 (weeks 2–6)** — Public API, admin, all marketing sections, elevation stack, enquiry flow, payment calculator, dual UI mode, SEO and analytics.
*Done when:* a status change in the admin appears publicly within 60s; every unit's schedule sums exactly to its price; Lighthouse ≥95 performance and 100 accessibility on mobile; both UI modes render full content.

**Phase 2 (weeks 6–9)** — Worker, upload flow, variants, depth maps, the time system, parallax hero, video encoding, gallery.
*Done when:* a 4096px upload produces every derivative in under 90s with no manual step; the scrubber transitions everything at 60fps on mid-range Android; reduced-motion snaps instantly.

**Phase 3 (weeks 9–14)** — Panorama tiling, tour admin, tour viewer with time-state swapping, interactive floor plans, keyboard mode.
*Done when:* a scene shows a preview within 1s on 4G and full resolution within 4s; switching time inside the tour preserves camera direction; a new scene added in the admin appears live with no deploy.

**Phase 4 (weeks 14–19)** — Frame sequences, interactive video with hotspots, walkthrough with chapter hand-off, building selector, sun simulator, every fallback tested by forcing each condition.
*Done when:* coarse scrubbing is interactive within 800ms on 4G; clicking a unit on the rotating building opens the right panel; the walkthrough hands off to the correct tour scene.

**Phase 5 (weeks 19–24)** — Gaussian splat scenes behind an explicit entry button (≤25MB initial), virtual staging, and an AI concierge built as a **deterministic engine plus a narration layer**: intent parsing produces structured filters, a real database query returns exact rows, and the model only writes prose about that result. The model never emits a number — reject any output containing a digit absent from the result set.

### Working rules

Follow the phase order; don't work ahead. Demonstrate acceptance criteria rather than asserting them. Never invent prices, unit data or marketing copy — use seed fixtures and leave `TODO(content)` markers. TypeScript strict, no bare `any`. Tests alongside code. When the spec is ambiguous or looks wrong, ask rather than guess.

Start by summarising what you understood in one page, listing your open questions, and proposing your Phase 0 file structure. Do not write code until I confirm.
