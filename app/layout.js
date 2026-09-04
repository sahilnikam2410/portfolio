import { Analytics } from '@vercel/analytics/next';
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={mono.variable}>
      <body style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>
        {children}
        <JsonLd />
        <Analytics />
      </body>
    </html>
  );
}
