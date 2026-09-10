import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveUiMode, timeStateForDate } from '@avida/types';
import { Nav } from '../components/Nav';
import { TimeStateProvider } from '../lib/time-state/TimeStateProvider';
import { DEVELOPMENT_SLUG, getDevelopment } from '../lib/api';
import '../styles/fonts.css';
import '../styles/tokens.css';
import '../styles/app.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Kivu Ridge', template: '%s — Kivu Ridge' },
  description: 'TODO(content) — placeholder description for the seed development.',
  openGraph: { type: 'website', siteName: 'Kivu Ridge' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The server cannot know the visitor's clock, so it renders from its own and
  // the provider corrects to the real local state on mount (§6.2). Setting the
  // attribute here rather than in an effect avoids a flash of the wrong palette.
  const serverState = timeStateForDate();
  const h = await headers();
  const uiMode = resolveUiMode({
    param: h.get('x-ui-mode'),
    envDefault: process.env.NEXT_PUBLIC_UI_MODE_DEFAULT ?? null,
  });

  // §6.7 — the shell must render even when the API is down; only the name is
  // needed here, and a fallback is better than a blank page.
  const name = await getDevelopment(DEVELOPMENT_SLUG)
    .then((d) => d.name)
    .catch(() => 'Kivu Ridge');

  return (
    <html lang="en" data-time={serverState} data-ui-mode={uiMode}>
      <body>
        <a href="#hero" className="skip-link">
          Skip to content
        </a>
        <TimeStateProvider initialState={serverState}>
          <Nav mode={uiMode} developmentName={name} />
          {children}
        </TimeStateProvider>
      </body>
    </html>
  );
}
