'use client';

import { feed } from '@/data/content';
import { Section, Reveal } from './ui';

/**
 * Published elsewhere.
 *
 * No embeds and no third-party script. The alternative was loading
 * LinkedIn's and Meta's widgets, which would mean opening a content security
 * policy that currently allows nothing but this origin — on a site whose own
 * smoke test asserts that policy stays clean. Running trackers to prove one
 * is active would be arguing against the rest of the page.
 *
 * So each entry is a card that links out. Nothing loads until it is clicked,
 * which also means no expiring API token and nothing to break the day a
 * platform changes its terms.
 */

const PLATFORM = {
  linkedin: { label: 'LinkedIn', tone: 'text-[var(--color-cyan)]' },
  instagram: { label: 'Instagram', tone: 'text-[var(--color-cyan)]' },
  youtube: { label: 'YouTube', tone: 'text-[var(--color-cyan)]' },
  press: { label: 'Press', tone: 'text-[var(--color-acid)]' },
  vrikaan: { label: 'Vrikaan', tone: 'text-[var(--color-acid)]' },
};

function when(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function Feed() {
  if (!feed?.length) return null;

  const items = [...feed].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <Section
      id="posts"
      index="06"
      title="published elsewhere"
      subtitle="Write-ups, product notes and coverage. Links out — nothing here loads a third-party script."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => {
          const p = PLATFORM[item.platform] ?? { label: item.platform, tone: 'text-[var(--color-dim)]' };
          return (
            <li key={item.url}>
              <Reveal delay={i * 0.05}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block h-full border border-[rgb(var(--acid-rgb)/0.14)] bg-[rgba(8,13,18,0.55)] transition-colors hover:border-[var(--color-acid)]"
                >
                  {item.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image}
                      alt={item.alt ?? ''}
                      loading="lazy"
                      className="w-full border-b border-[rgb(var(--acid-rgb)/0.14)]"
                    />
                  )}

                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
                      <span className={p.tone}>{p.label}</span>
                      {item.date && (
                        <>
                          <span className="text-[rgb(var(--dim-rgb)/0.5)]">·</span>
                          <span className="text-[var(--color-dim)]">{when(item.date)}</span>
                        </>
                      )}
                    </div>

                    <div className="text-[15px] leading-snug text-[var(--color-bone)]">
                      {item.title}
                    </div>

                    {item.blurb && (
                      <p className="prose-text mt-2 text-[13px] leading-relaxed text-[var(--color-prose)]">
                        {item.blurb}
                      </p>
                    )}

                    <span className="mt-3 inline-block text-[12px] text-[var(--color-dim)] group-hover:text-[var(--color-acid)]">
                      open ↗
                    </span>
                  </div>
                </a>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
