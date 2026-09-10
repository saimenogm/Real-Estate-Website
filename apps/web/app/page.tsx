import { formatArea, formatCount, formatMoney, formatMoneyRange } from '@avida/types';
import { CgiDisclaimer } from '../components/CgiDisclaimer';
import { TimeScrubber } from '../components/TimeScrubber';
import { TimedImage } from '../components/TimedImage';
import { getDevelopment, type DevelopmentDto } from '../lib/api';

/** §11 — ISR, revalidated by webhook on any content or inventory change. */
export const revalidate = 3600;

export default async function Page() {
  let dev: DevelopmentDto | null = null;
  let error: string | null = null;

  try {
    dev = await getDevelopment();
  } catch (e) {
    // §6.7 — at build time this must fail the build. In dev, before the API is
    // running, showing what is wrong beats a stack trace on a blank page.
    if (process.env.NODE_ENV === 'production') throw e;
    error = (e as Error).message;
  }

  if (!dev) {
    return (
      <main className="page">
        <h1 className="display">Phase 0</h1>
        <p className="lead">
          The API is not answering yet, so there is no development to render.
        </p>
        <pre className="fault">{error}</pre>
        <p>
          Start the services with <code>pnpm infra:up</code>, then{' '}
          <code>pnpm db:migrate &amp;&amp; pnpm db:seed</code>.
        </p>
        <TimeScrubber />
      </main>
    );
  }

  const hero = dev.mediaSets.find((s) => s.key === 'hero-exterior') ?? dev.mediaSets[0];
  const { summary } = dev;

  return (
    <main className="page">
      <header className="hero">
        {hero && <TimedImage set={hero} priority className="hero-image" />}
        <div className="hero-copy">
          {/* §2.4 — the development's name is the one italic display moment. */}
          <h1 className="display display-italic">{dev.name}</h1>
          {dev.tagline && <p className="lead">{dev.tagline}</p>}
          {/* §2.1 — no middle-dot meta strings. Two facts, two sentences. */}
          <p className="meta">
            {dev.city}. {formatCount(summary.available)} of {summary.total} units available.
          </p>
        </div>
        <CgiDisclaimer className="disclaimer" />
      </header>

      <section className="section">
        <h2 className="head">Time of day</h2>
        <p className="prose">
          The palette is bound to the clock. Moving between the four states changes the
          background, the type colour, the accent and every image together.
        </p>
        <TimeScrubber />
      </section>

      <section className="section">
        <h2 className="head">Residences</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Typology</th>
              <th scope="col">Bedrooms</th>
              <th scope="col">Area</th>
            </tr>
          </thead>
          <tbody>
            {dev.typologies.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td data-numeric>{t.bedrooms === 0 ? 'Studio' : t.bedrooms}</td>
                <td data-numeric>
                  {formatArea(t.areaSqmMin)} – {formatArea(t.areaSqmMax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2 className="head">Availability</h2>
        <p className="prose">
          {formatCount(summary.available)} available, {`${summary.percentSold}%`} of the building
          sold.
          {summary.priceMinorMin !== null && summary.priceMinorMax !== null && (
            <>
              {' '}
              Available units run{' '}
              <span data-numeric>
                {formatMoneyRange(
                  { amountMinor: summary.priceMinorMin, currency: dev.currency },
                  { amountMinor: summary.priceMinorMax, currency: dev.currency },
                )}
              </span>
              .
            </>
          )}
        </p>
        <ul className="statuses">
          {Object.entries(summary.byStatus).map(([status, count]) => (
            <li key={status}>
              <span className="status-label">{status.toLowerCase().replace('_', ' ')}</span>
              <span data-numeric>{count}</span>
            </li>
          ))}
        </ul>
        <p className="note">
          The elevation stack (§2.5) replaces this table in Phase 1. Phase 0 proves the data.
        </p>
      </section>

      <section className="section">
        <h2 className="head">Location</h2>
        <ul className="landmarks">
          {dev.landmarks.slice(0, 6).map((l) => (
            <li key={l.id}>
              <span>{l.name}</span>
              <span data-numeric>
                {l.distanceM === null
                  ? '—'
                  : l.distanceM < 1000
                    ? `${l.distanceM} m`
                    : `${(l.distanceM / 1000).toFixed(1)} km`}
              </span>
            </li>
          ))}
        </ul>
        <p className="note">Distances computed by PostGIS from the site coordinates. Travel times are modelled.</p>
      </section>

      <section className="section">
        <h2 className="head">Payment</h2>
        <ol className="milestones">
          {dev.milestones.map((m) => (
            <li key={m.id}>
              <span>{m.label}</span>
              <span data-numeric>{m.percent}%</span>
              {summary.priceMinorMin !== null && (
                <span data-numeric className="muted">
                  {formatMoney({
                    amountMinor: Math.round((summary.priceMinorMin * m.percent) / 100),
                    currency: dev.currency,
                  })}{' '}
                  on the lowest available price
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <footer className="footer">
        <p className="note">
          Placeholder content throughout. Real copy, prices and imagery replace it before launch.
        </p>
      </footer>
    </main>
  );
}
