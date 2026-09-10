import type { Metadata } from 'next';
import { getDevelopment, getProgress } from '../../../lib/api';
import { SiteFooter } from '../../../components/sections/Content';
import { ProgressTimeline } from '../../../components/sections/ProgressTimeline';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Construction progress',
  description: 'Dated updates from the site as the building goes up.',
  alternates: { canonical: '/progress' },
};

export default async function ProgressPage() {
  const [dev, updates] = await Promise.all([getDevelopment(), getProgress()]);
  return (
    <main className="page">
      <h1 className="display">Progress</h1>
      <ProgressTimeline updates={updates} />
      <SiteFooter dev={dev} />
    </main>
  );
}
