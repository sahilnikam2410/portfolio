import { identity, socials, skills, certs, projects, timeline } from '@/data/content';
import { siteUrl } from '@/data/site';

/**
 * JSON Resume (https://jsonresume.org) built from the same content the site
 * renders, so a recruiter's tooling or an ATS can ingest the record without
 * parsing a PDF. One source of truth: change data/content.js and this moves
 * with it. Static, so it is a plain file at the edge.
 */
export const dynamic = 'force-static';

export function GET() {
  const profiles = socials
    .filter((s) => s.href.startsWith('http'))
    .map((s) => ({ network: s.label, url: s.href, username: s.handle }));

  const resume = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: identity.name,
      label: identity.role,
      email: identity.email,
      phone: identity.phone,
      url: siteUrl,
      summary: identity.bio.join(' '),
      location: { city: 'Nashik', region: 'Maharashtra', countryCode: 'IN' },
      profiles,
    },
    // A degree is not employment. Splitting them matters because parsers read
    // the two sections differently — a degree in `work` reads as a job title.
    work: timeline
      .filter((t) => t.title.includes(' — ') && !/^B\.Tech/i.test(t.title))
      .map((t) => {
        const [position, name] = t.title.split(' — ');
        return { name, position, startDate: t.year, summary: t.body };
      }),
    education: timeline
      .filter((t) => /^B\.Tech/i.test(t.title))
      .map((t) => {
        const [studyType, institution] = t.title.split(' — ');
        return {
          institution,
          studyType,
          area: 'Computer Science & Engineering',
          startDate: '2022',
          endDate: '2026',
          score: '8.53 / 10',
          summary: t.body,
        };
      }),
    projects: projects.map((p) => ({
      name: p.title,
      description: p.summary,
      keywords: p.stack,
      highlights: p.highlights,
      url: p.repo || p.site || `${siteUrl}/work/${p.id}`,
    })),
    skills: skills.map((g) => ({ name: g.group, keywords: g.items })),
    certificates: certs.map((c) => ({ name: c.name, issuer: c.issuer, date: c.year })),
    meta: {
      canonical: `${siteUrl}/resume.json`,
      version: 'v1',
      note: 'Generated from the portfolio content. The role-targeted PDFs live under /resumes.',
    },
  };

  return Response.json(resume, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
