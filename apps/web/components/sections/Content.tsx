import Link from 'next/link';
import {
  formatAreaRange,
  formatCount,
  formatDistance,
  formatMoney,
  formatPercent,
  formatQuarter,
} from '@avida/types';
import type { DevelopmentDto, MediaSetDto } from '../../lib/api';
import { CgiDisclaimer } from '../CgiDisclaimer';
import { ParallaxHero } from '../ParallaxHero';
import { TimedImage } from '../TimedImage';
import { TimeScrubber } from '../TimeScrubber';

/**
 * §6.3 — the marketing sections. Server components: none of them need client
 * state, so none of them ship JavaScript. Only the time system, the elevation
 * stack and the enquiry form are interactive.
 */

export function Hero({ dev, hero }: { dev: DevelopmentDto; hero?: MediaSetDto }) {
  const { summary } = dev;

  return (
    <header id="hero" className="hero bleed">
      {/*
        §8 F8 — the depth-parallax hero. ParallaxHero probes the device once
        (§8.1) and renders a flat TimedImage unless WebGL2, enough memory, a
        fast connection and no reduced-motion preference all hold, so the image
        is still the LCP element on everything else (§6.6).
      */}
      {hero && <ParallaxHero set={hero} className="hero-image" />}

      <div className="hero-copy">
        {/* §2.4 — the development's name is the one italic display moment. */}
        <h1 className="display display-italic">{dev.name}</h1>
        {dev.tagline && <p className="lead">{dev.tagline}</p>}

        {/*
          The three questions a buyer actually arrives with (§1.2), answered
          above the fold as numbers rather than adjectives (§2.7). Written as a
          definition list, not a meta string joined with middle dots (§2.1).
        */}
        <dl className="hero-facts">
          <div>
            <dt>Available</dt>
            <dd>
              {formatCount(summary.available)} of {summary.total}
            </dd>
          </div>
          {summary.priceMinorMin !== null && (
            <div>
              <dt>From</dt>
              <dd>{formatMoney({ amountMinor: summary.priceMinorMin, currency: dev.currency })}</dd>
            </div>
          )}
          {dev.handoverDate && (
            <div>
              <dt>Handover</dt>
              <dd>{formatQuarter(dev.handoverDate)}</dd>
            </div>
          )}
          <div>
            <dt>Where</dt>
            <dd>{dev.city}</dd>
          </div>
        </dl>

        <div className="hero-scrubber">
          <TimeScrubber />
        </div>

        <CgiDisclaimer className="disclaimer" />
      </div>
    </header>
  );
}

export function Narrative({ dev, aerial }: { dev: DevelopmentDto; aerial?: MediaSetDto }) {
  // The seed description is markdown-ish placeholder; Phase 1 renders paragraphs
  // rather than pulling in a markdown pipeline for text that will be replaced.
  const paragraphs = dev.descriptionMd
    .split('\n\n')
    .map((p) => p.replace(/^_|_$/g, '').trim())
    .filter(Boolean);

  return (
    <section id="narrative" className="section">
      <h2 className="head">The building</h2>
      <div className="prose">
        {paragraphs.slice(0, 2).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {aerial && (
        <figure className="figure-wide">
          <TimedImage set={aerial} className="figure-image" />
          <figcaption className="note">
            {aerial.label}. <CgiDisclaimerInline />
          </figcaption>
        </figure>
      )}
      <div className="prose">
        {paragraphs.slice(2).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function CgiDisclaimerInline() {
  return <span>Computer-generated image. Final finishes, layout and views subject to change.</span>;
}

export function Residences({ dev, mode }: { dev: DevelopmentDto; mode: 'single' | 'multi' }) {
  return (
    <section id="residences" className="section">
      <h2 className="head">Residences</h2>
      <p className="prose">
        Five plans across ten floors. Areas are internal; every apartment has a balcony.
      </p>

      <ul className="typology-list">
        {dev.typologies.map((t) => (
          <li key={t.id} className="typology-card">
            <h3 className="typology-name">
              {mode === 'multi' ? (
                <Link href={`/residences/${t.slug}`}>{t.name}</Link>
              ) : (
                t.name
              )}
            </h3>
            <dl className="typology-facts">
              <div>
                <dt>Bedrooms</dt>
                <dd data-numeric>{t.bedrooms === 0 ? 'Studio' : t.bedrooms}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd data-numeric>{formatAreaRange(t.areaSqmMin, t.areaSqmMax)}</dd>
              </div>
              <div>
                <dt>Available</dt>
                <dd data-numeric>
                  {t.summary.available} of {t.summary.total}
                </dd>
              </div>
              {t.summary.priceMinorFrom !== null && (
                <div>
                  <dt>From</dt>
                  <dd data-numeric>
                    {formatMoney({
                      amountMinor: t.summary.priceMinorFrom,
                      currency: dev.currency,
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Amenities({ dev }: { dev: DevelopmentDto }) {
  return (
    <section id="amenities" className="section">
      <h2 className="head">Amenities</h2>
      {/* §6.3 — editorial layout, not a card grid: alternating text blocks with
          real descriptions rather than eight identical rounded boxes (§2.1). */}
      <div className="amenity-list">
        {dev.amenities.map((a, i) => (
          <article key={a.id} className="amenity" data-align={i % 2 === 0 ? 'start' : 'end'}>
            <h3 className="amenity-name">{a.name}</h3>
            {a.descriptionMd && <p className="prose">{a.descriptionMd}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

export function Location({ dev }: { dev: DevelopmentDto }) {
  return (
    <section id="location" className="section">
      <h2 className="head">Location</h2>
      <p className="prose">
        {dev.city}, {dev.country}. Distances are straight-line from the site; travel times are
        modelled estimates, not promises.
      </p>
      <ul className="landmarks">
        {dev.landmarks.map((l) => (
          <li key={l.id}>
            <span>{l.name}</span>
            <span className="landmark-meta">
              <span data-numeric>{l.distanceM === null ? '—' : formatDistance(l.distanceM)}</span>
              {l.driveMinutes !== null && (
                <span data-numeric className="muted">
                  {l.driveMinutes} min drive
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PaymentPlan({ dev }: { dev: DevelopmentDto }) {
  const from = dev.summary.priceMinorMin;
  return (
    <section id="payment" className="section">
      <h2 className="head">Payment plan</h2>
      <p className="prose">
        Six stages from reservation to handover. Select a unit on the availability drawing to see
        the schedule for its exact price.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col" className="align-right">
              Share
            </th>
            {from !== null && (
              <th scope="col" className="align-right">
                On the lowest available price
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {dev.milestones.map((m) => (
            <tr key={m.id}>
              <th scope="row">{m.label}</th>
              <td data-numeric className="align-right">
                {formatPercent(m.percent)}
              </td>
              {from !== null && (
                <td data-numeric className="align-right muted">
                  {formatMoney({
                    amountMinor: Math.round((from * m.percent) / 100),
                    currency: dev.currency,
                  })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Developer() {
  return (
    <section id="developer" className="section">
      <h2 className="head">The developer</h2>
      {/* TODO(content) — §7.8 item 7: completed projects, dates, unit counts. */}
      <p className="prose">
        Track record, completed projects and delivery guarantees go here. This is the section that
        answers whether a buyer can trust the building to be finished, and it is the one piece of
        the site that cannot be written without the developer.
      </p>
      <p className="note">TODO(content) — awaiting the developer&rsquo;s track record.</p>
    </section>
  );
}

export function Faq({ dev }: { dev: DevelopmentDto }) {
  return (
    <section id="faq" className="section">
      <h2 className="head">Questions</h2>
      <dl className="faq">
        {dev.faqs.map((f) => (
          <div key={f.id} className="faq-item">
            <dt>{f.question}</dt>
            <dd>{f.answerMd}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SiteFooter({ dev }: { dev: DevelopmentDto }) {
  return (
    <footer className="footer">
      <p className="note">
        {dev.name}, {dev.city}. Computer-generated imagery throughout; final finishes, layout and
        views subject to change. Prices and availability are indicative and subject to contract.
      </p>
      <p className="note">TODO(content) — sales terms, reservation terms and privacy policy.</p>
    </footer>
  );
}
