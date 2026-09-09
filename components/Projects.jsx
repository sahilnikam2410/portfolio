'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projects } from '@/data/content';
import { Section, Panel, Tag, Reveal } from './ui';

export default function Projects() {
  const [active, setActive] = useState(projects[0].id);
  const current = projects.find((p) => p.id === active) ?? projects[0];

  // the command palette can jump straight to an engagement
  useEffect(() => {
    const onSelect = (e) => {
      if (typeof e.detail === 'string') setActive(e.detail);
    };
    window.addEventListener('select-project', onSelect);
    return () => window.removeEventListener('select-project', onSelect);
  }, []);

  return (
    <Section
      id="work"
      index="03"
      title="engagements"
      subtitle="Lab-scoped projects. Each one is something I built, broke, and then documented the fix for."
    >
      {/* Explicit tracks with a zero floor. A bare `grid` gives one auto
          column whose minimum is the items' min-content, so the widest thing
          in either panel set the track and both panels overflowed the section
          by 18px on a phone. minmax(0,1fr) lets the track shrink and the
          content wrap instead. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* file-tree selector */}
        <Reveal>
          <Panel className="p-2">
            <div className="px-3 py-2 text-[11px] text-[var(--color-dim)]">~/engagements</div>
            <ul>
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setActive(p.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors ${
                      active === p.id
                        ? 'bg-[rgb(var(--acid-rgb)/0.1)] text-[var(--color-acid)]'
                        : 'text-[var(--color-dim)] hover:text-[var(--color-bone)]'
                    }`}
                  >
                    <span className={active === p.id ? 'text-[var(--color-acid)]' : 'text-[var(--color-dim)]'}>
                      {active === p.id ? '▾' : '▸'}
                    </span>
                    <span className="truncate">{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        {/* detail pane */}
        <Reveal delay={0.1}>
          <Panel className="min-h-[420px] p-6 sm:p-8">
            {/* Keyed on the project id, so switching remounts and the CSS
                entrance runs again. framer's exit animation goes with it —
                that is the one thing CSS cannot do here, and it cost this
                page the whole animation library in its first chunk. */}
            <div key={current.id} className="anim-rise">
                <div className="text-[11px] text-[var(--color-cyan)]">{current.kind}</div>
                <h3 className="mt-2 text-2xl text-[var(--color-bone)]">{current.title}</h3>

                <p className="prose-text mt-4 max-w-2xl text-[14px] leading-[1.8] text-[var(--color-prose)]">
                  {current.summary}
                </p>

                <ul className="mt-6 space-y-2">
                  {current.highlights.map((h) => (
                    <li key={h} className="prose-text flex gap-3 text-[13px] text-[var(--color-bone)]">
                      <span className="mt-0.5 text-[var(--color-acid)]">$</span>
                      <span className="text-[var(--color-dim)]">{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap gap-2">
                  {current.stack.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/work/${current.id}`}
                    data-cursor="read"
                    className="border border-[rgb(var(--acid-rgb)/0.35)] px-4 py-2 text-[13px] text-[var(--color-acid)] transition-colors hover:bg-[rgb(var(--acid-rgb)/0.1)]"
                  >
                    case study →
                  </Link>

                  {(current.repo || current.site) && (
                    <a
                      href={current.repo ?? current.site}
                      target="_blank"
                      rel="noreferrer"
                      title={
                        current.repoKind === 'writeup'
                          ? 'the write-up and the detection rules; the implementation is not published there yet'
                          : undefined
                      }
                      className="border border-[rgb(var(--acid-rgb)/0.2)] px-4 py-2 text-[13px] text-[var(--color-bone)] transition-colors hover:border-[var(--color-acid)]"
                    >
                      {current.repo
                        ? current.repoKind === 'writeup'
                          ? 'write-up'
                          : 'repository'
                        : 'live site'}{' '}
                      ↗
                    </a>
                  )}
                </div>
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}
