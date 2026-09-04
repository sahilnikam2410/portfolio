import { siteUrl } from '@/data/site';
import { projects } from '@/data/content';

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.id}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    })),
  ];
}
