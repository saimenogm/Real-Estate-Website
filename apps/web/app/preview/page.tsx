import { notFound } from 'next/navigation';
import { fixtureDevelopment, fixtureInventory } from '../../lib/fixtures/development';
import { Availability } from '../../components/sections/Availability';
import {
  Amenities,
  Developer,
  Faq,
  Hero,
  Location,
  Narrative,
  PaymentPlan,
  Residences,
  SiteFooter,
} from '../../components/sections/Content';
import { EnquiryCta } from '../../components/sections/EnquiryCta';
import { Gallery } from '../../components/Gallery';
import { ProgressTimeline } from '../../components/sections/ProgressTimeline';

/**
 * A design harness: every section, rendered from fixtures, with no API and no
 * database. It exists so the interface can be judged — type, rhythm, colour,
 * all four time states — without the whole stack running, and so a visual
 * regression can be caught in one page rather than five routes.
 *
 * Not shipped: it 404s outside development, so it cannot be reached in
 * production even if someone links to it.
 */
export default function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const dev = fixtureDevelopment;
  const hero = dev.mediaSets.find((s) => s.key === 'hero-exterior');
  const aerial = dev.mediaSets.find((s) => s.key === 'aerial-context');

  return (
    <main className="page">
      <Hero dev={dev} hero={hero} />
      <Narrative dev={dev} aerial={aerial} />
      <Residences dev={dev} mode="multi" />
      <Availability inventory={fixtureInventory} />
      <Amenities dev={dev} />
      <Location dev={dev} />
      <section id="gallery" className="section">
        <h2 className="head">Gallery</h2>
        <Gallery sets={dev.mediaSets} />
      </section>
      <PaymentPlan dev={dev} />
      <ProgressTimeline updates={[]} />
      <Developer />
      <Faq dev={dev} />
      <EnquiryCta />
      <SiteFooter dev={dev} />
    </main>
  );
}
