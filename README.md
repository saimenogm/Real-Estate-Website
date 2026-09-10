# Kivu Ridge — pre-construction sales platform

A sales instrument for a single luxury residential development: live unit
inventory, a payment calculator, 360° tours, and a palette bound to the time of
day. Not a listings portal — one building, a fixed inventory, no public accounts.

The full specification is **[`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)**
(v1.1). Read §2 before touching any styling — it is binding, and it is a
rejection list as much as a direction. Choices the spec left open are recorded in
[`docs/DECISIONS.md`](docs/DECISIONS.md).

> All product content in the repository today is placeholder, marked
> `TODO(content)`. The development, its prices and its imagery are invented.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node | 24 (see `.nvmrc`) | 20.11+ works |
| pnpm | 9.15.4 | `corepack enable && corepack prepare pnpm@9.15.4 --activate` |
| Docker | any recent | Must be **running** — Postgres, Redis and MinIO come from compose |

## From a clean checkout to a running site

```bash
pnpm install
cp .env.example .env          # local defaults work as-is
pnpm infra:up                 # postgres+postgis, redis, minio
pnpm db:generate              # prisma client
pnpm --filter @avida/db migrate:deploy
pnpm db:seed                  # 92 units, 5 typologies, 16 placeholder images
pnpm dev                      # all four apps
```

Then open <http://localhost:3000> and move the time scrubber.

| App | Port | What it is |
|---|---|---|
| web | 3000 | The public site (Next.js) |
| api | 3001 | Public + admin API (NestJS, base path `/api/v1`) |
| admin | 3002 | Sales team admin (Vite; Phase 1) |
| worker | — | Media pipeline queues (BullMQ; processors land in Phase 2) |
| postgres | 5432 | `avida` / `avida` |
| redis | 6379 | |
| minio | 9000, console 9001 | `minioadmin` / `minioadmin` |

Check it is alive:

```bash
curl localhost:3001/api/v1/health/deep
curl localhost:3001/api/v1/development/seed-dev | head -c 400
```

## Layout

```
apps/
  web/      Next.js 16 public site — tokens, time-state system, sections
  api/      NestJS 11 + Fastify — public reads, admin writes
  admin/    Vite + React — sales team console
  worker/   BullMQ processors for the media pipeline
packages/
  db/       Prisma schema, migrations, seed
  types/    Shared DTOs, the payment calculator, all formatting
  config/   Shared tsconfig
infra/      docker-compose for local services
docs/       DECISIONS.md, CONTENT_BRIEF.md
```

## Everyday commands

```bash
pnpm dev                 # everything, watched
pnpm build               # every app; must pass before a phase is done
pnpm test                # unit tests
pnpm typecheck
pnpm db:reset            # drop, migrate, reseed  (destroys local data)
pnpm check:env           # .env.example matches what the code reads
pnpm check:secrets       # nothing secret exposed to a client bundle
pnpm infra:down          # stop the containers
```

## House rules

These are enforced, not aspirational — see §16 of the plan.

- **Colour comes from tokens only.** `styles/tokens.css` defines all four time
  states; components read `var(--…)` and never compute a colour from the time
  state. `apps/web/tests/tokens.contrast.test.ts` asserts the contrast floor on
  every run, in every state.
- **No `text-transform: uppercase`, anywhere** (§2.4).
- **Money is an integer in minor units** (§4.2). Format through
  `@avida/types/format`, never with a bare `Intl` call in a component.
- **Derived values are computed, never stored** (§4.4) — unit counts, price
  ranges, percent sold.
- **Every CG image carries the disclaimer** (§13), next to the image.
- Tests are written alongside the code, not after.

## Current state

Phases 0 through 6 are implemented. What that means concretely:

| Phase | Built | Verified |
|---|---|---|
| 0 Foundation | monorepo, services, schema, seed, tokens, fonts | end to end, in a browser |
| 1 Marketing + leads | public API, elevation stack, filters, unit panel, enquiry flow, admin, dual UI mode, SEO | API paths verified live; UI typechecked and unit-tested |
| 2 Media pipeline | variants, thumbhash, depth, video, frames, gallery, parallax hero | code complete; needs real assets to exercise |
| 3 Tour | panorama tiling, viewer with time-state swap, plan minimap | code complete; needs panoramas |
| 4 Interactive 3D | frame-sequence player, building selector, sun simulator | code complete; needs renders and the architect's model |
| 5 Immersive + AI | splat gate, virtual staging, concierge | concierge fully tested; splats need a capture |
| 6 Ongoing | progress timeline | code complete |

**The honest caveat**: Phases 2–5 are the code that *drives* renders, panoramas,
frame sequences and a decimated glTF. None of those assets exist yet — see
[`docs/CONTENT_BRIEF.md`](docs/CONTENT_BRIEF.md). Every one of those features
degrades independently (§8.1), so the site works today without them.

§15 of the plan lists eight questions that should be answered before real
content lands; two of them change the schema.
