# Decisions

Every choice the specification left open, and why it went the way it did.
One entry per decision. Amend an entry when a decision changes; never delete it —
the reasoning is the point.

Referenced sections (§) are in `IMPLEMENTATION_PLAN.md` v1.1.

---

## D-01 — Dependency versions resolved at scaffold, not taken from the spec

**Status:** decided, 2026-09-09 · **§3.1 version policy**

The spec named majors chosen in 2025 as *floors*. Resolved at scaffold time:

| Package | Spec floor | Installed | Note |
|---|---|---|---|
| Next.js | 15 | **16.3.4** | See D-09 for the file-convention change it forced |
| React | — | **19.3.0** | |
| NestJS | 10 | **11.1.6** | 12.0.1 exists but `@nestjs/cli`, `nestjs-pino` and `@nestjs/throttler` had not all published matching majors; revisit in Phase 1 |
| Prisma | 5 | **7.10.0** | 8.x is release-candidate only. See D-02 |
| Tailwind | v4 | **not yet installed** | Phase 0 needs tokens, not utilities. See D-06 |
| TypeScript | — | **5.9.3** | 7.0.2 is stable but the Nest decorator toolchain and eslint plugins are not proven on it. Revisit in Phase 1 |
| Turborepo | — | **2.10.12** | |
| pnpm | — | **9.15.4** | pinned via `packageManager` |

`fastify` is pinned to **5.12.3** through a pnpm override: `@nestjs/platform-fastify`
wants 5.4.x and `@fastify/helmet`'s types want 5.12.x, and two copies of
`FastifyInstance` do not unify.

## D-02 — Prisma 7: driver adapter instead of a datasource URL

**Status:** decided, 2026-09-09 · **§4.1**

Prisma 7 removed `url` from the `datasource` block. The connection now comes from
`@prisma/adapter-pg` at runtime (`packages/db/src/index.ts`) and from
`packages/db/prisma.config.ts` for the CLI. `@prisma/client-runtime-utils` is an
explicit dependency because pnpm's strict layout does not hoist it.

The schema declares all four extensions the `postgis/postgis` image installs
(`postgis`, `postgis_topology`, `postgis_tiger_geocoder`, `fuzzystrmatch`).
Declaring only `postgis` makes every `migrate dev` report drift.

## D-03 — Env loading lives in `@avida/db`

**Status:** decided, 2026-09-09

One `.env` at the repo root. `packages/db/src/env.ts` finds it by walking up for
`pnpm-workspace.yaml` and loads it before the client is constructed. It does not
use `import.meta.url`: the package is consumed from an ESM build (worker, web)
and a CommonJS one (the Nest API), and `import.meta` is illegal in the latter.
Existing environment values always win, so a deployment's real variables are
never overridden by a stray local file.

## D-04 — The payment calculator lives in `@avida/types`, not the API

**Status:** decided, 2026-09-09 · **§5.6**

The spec puts `computeSchedule` in the API's pricing module. It is a pure
function that both the server endpoint and the client-side calculator need, and
two implementations of the same arithmetic will eventually disagree about a
rounding cent. It sits in `packages/types/src/pricing.ts` with its tests; the API
resolves the data and calls it.

## D-05 — Milestone percentages are compared in basis points

**Status:** decided, 2026-09-09 · **§5.6 rule 5**

`percent` is a float, so `12.5 + 87.5 !== 100` is a live risk in binary floating
point. The sum is compared as integer basis points. 33.33 × 3 fails loudly, which
is correct — that structure cannot be represented exactly.

## D-06 — No Tailwind in Phase 0

**Status:** decided, 2026-09-09 · **§2.3, §3.1**

The spec lists Tailwind v4, and it will be added when there are components to
build. Phase 0 needs the token cascade to be the only colour authority, and
introducing a utility layer first invites `bg-neutral-100` to appear next to
`var(--surface)`. Tokens land in `styles/tokens.css`; Tailwind arrives in Phase 1
configured to consume those tokens, never to define colours.

## D-07 — Seed placeholders are SVG in the web app's `public/`

**Status:** decided, 2026-09-09 · **§4.6**

§4.6 asks for "solid-colour generated PNGs with the label baked in". They are
SVGs instead: no image-processing dependency in the db package, smaller, and
unmistakably not a render. They are written to `apps/web/public/seed-media/` and
served from the app's own origin, because Phase 0 has no media pipeline and no
reason to require MinIO to see a page. `mediaSrc()` routes any key starting
`seed-media/` locally and everything else to `NEXT_PUBLIC_MEDIA_URL`. Phase 2
replaces both the placeholders and that branch.

## D-08 — The seed generates all four time states for every media set

**Status:** decided, 2026-09-09 · **§4.3, §4.6**

§4.6 asks for 4 sets × 4 states = 16 assets; §4.3 sets a lower floor for
interiors (DAY and NIGHT). The seed generates all four for every set so the count
matches, and `requiredStates()` remains the validation rule the real renders must
satisfy. The seed throws if a set is incomplete.

## D-09 — `middleware.ts` renamed to `proxy.ts`

**Status:** decided, 2026-09-09 · **§6.1**

Next 16 deprecated the `middleware` file convention in favour of `proxy`. The UI
mode resolution (§6.1) is otherwise unchanged: query param, then cookie, then env
default, resolved in exactly one place.

## D-10 — Two dawn colour tokens were corrected

**Status:** decided, 2026-09-09 · **§2.3, §6.5, risk R5**

§2 is binding, and two of its dawn values fail the contrast floor §6.5 sets:

| Token | Spec | Ratio on dawn surface | Corrected to | New ratio |
|---|---|---|---|---|
| `--ink-muted` | `#63605F` | 4.39:1 (needs 4.5) | `#5F5C5B` | 4.67:1 |
| `--accent` | `#A0764C` | 2.85:1 (needs 3.0 for UI parts) | `#8E6842` | 3.52:1 |

Both are small darkenings that preserve the hue and the material reference
(anodised bronze). `apps/web/tests/tokens.contrast.test.ts` asserts the whole
palette on every run, so this class of failure cannot reach a Phase 1 axe report.
**This is a deviation from a binding section and should be reviewed by whoever
owns the design.**

## D-11 — The `--line` token is held to a house floor, not a WCAG one

**Status:** decided, 2026-09-09 · **§6.5**

`--line` is a decorative hairline; WCAG 1.4.11's 3:1 covers components that
convey meaning. Two of the spec's four states sit at 1.34–1.37 against their
surface. Rather than repaint the palette, the test asserts a visibility floor of
1.3 and the rule is written down: anything a visitor must perceive to understand
state uses `--ink-muted` or `--accent`, which are held to the real thresholds.

## D-12 — Dates are formatted in UTC

**Status:** decided, 2026-09-09 · **§3.5**

Every date the site shows is a calendar date, not an instant: handover, a
milestone, a progress capture. Formatting a UTC midnight in the viewer's local
zone moves it to the previous day for anyone west of Greenwich — caught by a test
that expected `3 Apr 2027` and got `2 Apr 2027`. `formatDate` pins `timeZone: 'UTC'`.

## D-13 — `currencyDisplay: 'narrowSymbol'`

**Status:** decided, 2026-09-09 · **§3.5**

`en-GB` renders USD as `US$285,000` and JPY as `JP¥4,500,000`. The site quotes
one currency throughout, so the country prefix carries no information and reads
as clutter in a headline price.

## D-14 — The image crossfade is a CSS animation on the incoming layer

**Status:** decided, 2026-09-09 · **§6.2**

The spec describes two stacked layers with an opacity swap. Implemented as: the
outgoing image underneath at full opacity, the incoming one above running a
1.2s fade-in, outgoing dropped on a timer.

The obvious alternative — mount the outgoing layer opaque and animate it to zero —
needs a paint in between, which means `requestAnimationFrame`. rAF does not run
in a background tab, so the outgoing layer would sit opaque over the new image
until its timer fired. Putting the animation on the incoming layer makes the
steady state already correct: if the animation is throttled, unsupported, or
disabled by reduced motion, the change is simply instant.

## D-15 — Seed fixtures use real Kigali geography

**Status:** provisional, 2026-09-09 · **§4.6, §15 Q1**

The development is placeholder ("Kivu Ridge") but its coordinates and the ten
landmarks are real, so the PostGIS distance calculations exercise real geometry
instead of invented numbers. Prices, unit codes, statuses and all copy are
fiction and carry `TODO(content)`. **Replaced wholesale when §15 Q1 is answered.**

## D-16 — Shared packages are built to `dist/`

**Status:** decided, 2026-09-09

`@avida/types` and `@avida/db` publish `dist/` rather than TypeScript source: the
compiled Nest API loads them through Node's resolver, which cannot read `.ts`.
Turbo's `dependsOn: ["^build"]` orders this. Note that files under `apps/web` use
extensionless relative imports (Next's bundler resolution) while the Node-targeted
packages use explicit `.js` specifiers.

## D-17 — Enquiry retention is modelled in the schema from day one

**Status:** decided, 2026-09-09 · **§5.9**

`Enquiry.purgeAfter` is a required column set to `createdAt + 24 months`, indexed,
with a `pii:purge` queue already declared in the worker. Retention added later is
retention never added. `Enquiry.verificationSkipped` exists for the §6.7 case
where Turnstile is unreachable and a lead is kept for manual review rather than
dropped. `AdminAuditLog` records exports, deletes and bulk status changes.
