/**
 * Canonical origin used for OG tags, robots.txt, the sitemap and security.txt.
 *
 * Two traps live here:
 *
 * 1. Next inlines `process.env.NEXT_PUBLIC_*` at build time, and an unset
 *    variable becomes the empty string rather than undefined. `?? fallback`
 *    therefore never fires, and `new URL('')` throws ERR_INVALID_URL — which
 *    failed the first Vercel build while working locally.
 * 2. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL are server-only, so this
 *    module must not be imported by a client component. Today it is used by
 *    the layout metadata, robots, sitemap, security.txt and the JSON-LD block,
 *    all of which run on the server.
 *
 * Set NEXT_PUBLIC_SITE_URL once a custom domain exists; until then Vercel's
 * own hostname is correct and needs no configuration.
 */
const clean = (value) => value?.trim().replace(/\/+$/, '') || '';

const explicit = clean(process.env.NEXT_PUBLIC_SITE_URL);

// production hostname first, then the per-deployment one for previews
const fromVercel = clean(
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
);

const candidate = explicit || (fromVercel ? `https://${fromVercel}` : '');

// never let a malformed value take the build down — a wrong canonical URL
// costs link previews, a thrown URL costs the whole deployment
function safeOrigin(value) {
  if (!value) return 'http://localhost:3000';
  try {
    return new URL(value).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export const siteUrl = safeOrigin(candidate);
