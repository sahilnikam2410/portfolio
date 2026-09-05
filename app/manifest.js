import { identity } from '@/data/content';

/**
 * Web app manifest. Makes the site installable and gives Android/Chrome a
 * proper name, colour and icon instead of a screenshot of the tab. The icon
 * reuses the existing SVG favicon, so there is one icon to maintain.
 */
export default function manifest() {
  return {
    name: `${identity.name} — ${identity.role}`,
    short_name: identity.handle === 'sahil' ? 'Sahil Nikam' : identity.handle,
    description: identity.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#04070a',
    theme_color: '#04070a',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
    ],
    categories: ['security', 'portfolio', 'technology'],
  };
}
