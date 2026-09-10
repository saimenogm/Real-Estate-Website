import type { Metadata } from 'next';
import { getDevelopment } from '../../../lib/api';
import { Amenities, Residences, SiteFooter } from '../../../components/sections/Content';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Residences',
  description: 'Five plans across ten floors, from studios to two penthouses.',
  alternates: { canonical: '/residences' },
};

export default async function ResidencesPage() {
  const dev = await getDevelopment();
  return (
    <main className="page">
      <h1 className="display">Residences</h1>
      <Residences dev={dev} mode="multi" />
      <Amenities dev={dev} />
      <SiteFooter dev={dev} />
    </main>
  );
}
