'use client';

import { feed, socRoadmap } from '@/data/content';
import { Section, Reveal } from './ui';
import AdCarousel from './AdCarousel';

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

/** Which phase a day falls in — the roadmap is ordered by its last day. */
function phaseFor(day) {
  return socRoadmap.find((p) => day <= p.to)?.name ?? null;
}

function when(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/** Platform and date, shared by both card shapes. */
function Meta({ item }) {
  const p = PLATFORM[item.platform] ?? { label: item.platform, tone: 'text-[var(--color-dim)]' };
  return (
    <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
      <span className={p.tone}>{p.label}</span>
      {item.date && (
        <>
          <span className="text-[rgb(var(--dim-rgb)/0.5)]">·</span>
          <span className="text-[var(--color-dim)]">{when(item.date)}</span>
        </>
      )}
    </div>
  );
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
        {items.map((item, i) => (
          /* h-full on both the item and the Reveal wrapper: Reveal renders a
             div between the grid item and the card, and left auto-height it
             made a card with images run taller than one without, leaving a
             hole in the row. */
          <li key={item.url} className="h-full [&>div]:h-full">
            <Reveal delay={i * 0.05}>
              {item.slides?.length ? (
                /* A carousel cannot live inside a link. Its strip and dots are
                   interactive, and nesting them in an anchor leaves both
                   unreachable by keyboard and ambiguous to a screen reader —
                   so this shape is a plain card that carries its own link. */
                <div className="flex h-full flex-col border border-[var(--edge)] bg-[var(--surface)]">
                  <AdCarousel slides={item.slides} label={`${item.title} — launch carousel`} />
                  <div className="p-4">
                    <Meta item={item} />
                    <div className="text-[15px] leading-snug text-[var(--color-bone)]">{item.title}</div>
                    {item.blurb && (
                      <p className="prose-text mt-2 text-[13px] leading-relaxed text-[var(--color-prose)]">
                        {item.blurb}
                      </p>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-[12px] text-[var(--color-dim)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-acid)]"
                    >
                      open ↗
                    </a>
                  </div>
                </div>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col border border-[var(--edge)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--color-acid)]"
                >
                  <Meta item={item} />
                  <div className="text-[15px] leading-snug text-[var(--color-bone)]">{item.title}</div>

                  {item.blurb && (
                    <p className="prose-text mt-2 text-[13px] leading-relaxed text-[var(--color-prose)]">
                      {item.blurb}
                    </p>
                  )}

                  {item.series && item.day && (
                    /* A running series shows its position. Three of a hundred
                       is not much and says so; the number is the whole point
                       of a daily challenge, and hiding it early would make it
                       worthless later. */
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                        <span className="text-[var(--color-dim)]">
                          {item.series}
                          {phaseFor(item.day) && (
                            <span className="text-[rgb(var(--dim-rgb)/0.7)]">{' · '}{phaseFor(item.day)}</span>
                          )}
                        </span>
                        <span className="t-num text-[var(--color-acid)]">
                          {item.day}
                          {item.of ? <span className="text-[var(--color-dim)]"> / {item.of}</span> : null}
                        </span>
                      </div>
                      {item.of ? (
                        <div
                          className="h-[2px] w-full bg-[rgb(var(--acid-rgb)/0.15)]"
                          role="img"
                          aria-label={`Day ${item.day} of ${item.of}`}
                        >
                          <div
                            className="h-full bg-[var(--color-acid)]"
                            style={{ width: `${Math.min(100, (item.day / item.of) * 100)}%` }}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}

                  <span className="mt-3 inline-block text-[12px] text-[var(--color-dim)] group-hover:text-[var(--color-acid)]">
                    open ↗
                  </span>
                </a>
              )}
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
