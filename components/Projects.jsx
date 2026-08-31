'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
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
                        ? 'bg-[rgba(53,255,158,0.1)] text-[var(--color-acid)]'
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
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <div className="text-[11px] text-[var(--color-cyan)]">{current.kind}</div>
                <h3 className="mt-2 text-2xl text-[var(--color-bone)]">{current.title}</h3>

                <p className="mt-4 max-w-2xl text-[14px] leading-[1.8] text-[var(--color-dim)]">
                  {current.summary}
                </p>

                <ul className="mt-6 space-y-2">
                  {current.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[13px] text-[var(--color-bone)]">
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

                {current.href && (
                  <a
                    href={current.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 inline-block border border-[rgba(53,255,158,0.35)] px-4 py-2 text-[13px] text-[var(--color-acid)] transition-colors hover:bg-[rgba(53,255,158,0.1)]"
                  >
                    open →
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}
