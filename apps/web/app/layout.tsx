import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { timeStateForDate } from '@avida/types';
import { TimeStateProvider } from '../lib/time-state/TimeStateProvider';
import '../styles/fonts.css';
import '../styles/tokens.css';
import '../styles/app.css';

export const metadata: Metadata = {
  title: 'Kivu Ridge',
  description: 'TODO(content) — placeholder description for the seed development.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The server cannot know the visitor's clock, so it renders `day` and the
  // provider corrects to the real local state on mount (§6.2). Setting the
  // attribute here rather than in an effect avoids a flash of the wrong palette.
  const serverState = timeStateForDate();
  const uiMode = (await headers()).get('x-ui-mode') ?? 'multi';

  return (
    <html lang="en" data-time={serverState} data-ui-mode={uiMode}>
      <body>
        <TimeStateProvider initialState={serverState}>{children}</TimeStateProvider>
      </body>
    </html>
  );
}
