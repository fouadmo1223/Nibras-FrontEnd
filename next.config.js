/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  // This project is self-contained; don't let the repo-root lockfile (tooling only) become the root.
  turbopack: { root: __dirname },
  // Cache Components: data is dynamic by default; public data opts in with
  // 'use cache' + cacheLife/cacheTag (see docs/caching.md).
  cacheComponents: true,
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Unsplash: temporary stock imagery (hero, section visuals) until real platform content
    // (courses, instructor/student photos) exists or the admin replaces it via the dashboard.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
