/**
 * Security headers.
 *
 * This is a security portfolio — it gets graded by anyone who thinks to run
 * securityheaders.com against it, and by every hiring manager who checks.
 *
 * Note on script-src: 'unsafe-inline' is present because the site is fully
 * prerendered and Next's hydration bootstrap is inline. The strict alternative
 * is a per-request nonce from middleware, which forces every page into dynamic
 * rendering and gives up static generation. For a static portfolio with no
 * user input, no auth and no session, that trade is not worth it — but the
 * reasoning is written down here rather than left as an accident.
 */
// Next's dev-mode HMR runtime uses eval(); production never does.
const dev = process.env.NODE_ENV === 'development';

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  `connect-src 'self'${dev ? ' ws: http://localhost:*' : ''} https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  poweredByHeader: false, // no free version disclosure
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
