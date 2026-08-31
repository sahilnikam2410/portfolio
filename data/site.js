/**
 * Canonical origin used for OG tags, robots.txt and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL in Vercel (Project → Settings → Environment Variables)
 * once the domain is live; the fallback only matters for local builds.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
