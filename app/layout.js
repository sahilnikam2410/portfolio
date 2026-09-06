import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { identity } from '@/data/content';
import { siteUrl } from '@/data/site';
import JsonLd from '@/components/JsonLd';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

const title = `${identity.name} — ${identity.role}`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: identity.tagline,
  keywords: [
    'SOC Analyst',
    'VAPT',
    'Wazuh',
    'Splunk',
    'MITRE ATT&CK',
    'penetration testing',
    'blue team',
    identity.name,
  ],
  authors: [{ name: identity.name }],
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description: identity.tagline,
    type: 'website',
    url: '/',
    siteName: identity.name,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: identity.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#04070a',
};

const onVercel = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <head>
        {/* Runs before first paint so a saved palette never flashes the wrong
            colours. Kept inline and tiny for that reason; anything deferred
            would repaint after the user already saw the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('site-theme');if(t==='spider')document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>
        {/* first tab stop: keyboard users should not have to walk the whole
            nav and a WebGL canvas to reach the content */}
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:border focus:border-[var(--color-acid)] focus:bg-[var(--color-void)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--color-acid)]"
        >
          skip to content
        </a>
        {children}
        <JsonLd />
        {/* Gate on NEXT_PUBLIC_VERCEL_ENV, which Vercel injects into the
            client bundle. process.env.VERCEL is not inlined at build time here,
            so gating on it silently disabled both in production. Off locally,
            where the insights script would 404 and trip the CSP. */}
        {onVercel && <Analytics />}
        {onVercel && <SpeedInsights />}
      </body>
    </html>
  );
}
