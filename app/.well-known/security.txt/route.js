import { identity } from '@/data/content';
import { siteUrl } from '@/data/site';

/**
 * RFC 9116 security.txt. A security portfolio that does not publish one is
 * making a statement it did not intend to make.
 */
export const dynamic = 'force-static';

export function GET() {
  // expires must be in the future; roll it forward a year from build time
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = [
    `Contact: mailto:${identity.email}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: en, hi, mr',
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    '',
    '# This site is a static portfolio. It holds no user data, no accounts and',
    '# no sessions. If you find something anyway, mail the address above and',
    '# you will get a reply.',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
