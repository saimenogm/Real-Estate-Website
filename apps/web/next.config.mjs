/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@avida/types'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    // §5.9 — security headers. CSP arrives in Phase 1 with the nonce plumbing;
    // these three cost nothing now and are easy to forget later.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
