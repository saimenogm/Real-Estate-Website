import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/**
 * Phase 0 — the admin app builds, runs, and can reach the API. Refine, auth
 * with TOTP, the unit list and the enquiry inbox are Phase 1 (§9).
 */
export function App() {
  const [health, setHealth] = useState<string>('checking…');

  useEffect(() => {
    fetch(`${API}/api/v1/health/deep`)
      .then((r) => r.json())
      .then((d) => setHealth(JSON.stringify(d, null, 2)))
      .catch((e: Error) => setHealth(`unreachable: ${e.message}`));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 32, maxWidth: 720 }}>
      <h1 style={{ fontWeight: 400 }}>Sales admin</h1>
      <p>Phase 0 scaffold. Unit status, enquiries and media land in Phase 1.</p>
      <pre style={{ background: '#f4f4f2', padding: 16, overflowX: 'auto' }}>{health}</pre>
    </main>
  );
}
