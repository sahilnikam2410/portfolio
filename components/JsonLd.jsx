import { identity, socials, skills, certs } from '@/data/content';
import { siteUrl } from '@/data/site';

/** schema.org Person — lets search engines resolve who this is, not just what it says. */
export default function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.name,
    jobTitle: identity.role,
    description: identity.tagline,
    email: `mailto:${identity.email}`,
    telephone: identity.phone,
    url: siteUrl,
    sameAs: socials.filter((s) => s.href.startsWith('http')).map((s) => s.href),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Shirdi',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Sandip University',
    },
    knowsAbout: skills.flatMap((g) => g.items),
    hasCredential: certs.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: c.issuer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // schema payload is generated from local data, not user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
