'use client';

import { identity, timeline, ethics } from '@/data/content';
import { Section, Panel, Reveal } from './ui';
import Topology from './Topology';

export default function About() {
  return (
    <Section
      id="about"
      index="01"
      title="whoami"
      subtitle="Who is behind the terminal, and how the work is scoped."
    >
      {/* Prose and timeline used to sit side by side. That split assumed the
          full page width, and inside the section's content column it left the
          timeline at 142px — fr tracks cannot shrink below their content, so
          the prose column took what it needed and the dates were squeezed
          into a ribbon. Stacked, both get the whole measure. */}
      <div className="grid gap-14">
        <div className="space-y-5">
          {identity.bio.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="t-body text-[var(--color-dim)]">{p}</p>
            </Reveal>
          ))}

          <div className="mt-8">
            <Topology />
          </div>

          <Reveal delay={0.2}>
            <Panel className="mt-5 p-5">
              <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-acid)]">
                <span>⚠</span>
                {ethics.title}
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-dim)]">{ethics.body}</p>
            </Panel>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <ol className="relative border-l border-[rgba(53,255,158,0.2)] pl-6">
            {timeline.map((t, i) => (
              <li key={i} className="mb-8 last:mb-0">
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-acid)] shadow-[0_0_10px_var(--color-acid)]" />
                <div className="text-xs text-[var(--color-cyan)]">{t.year}</div>
                <div className="mt-1 text-[15px] text-[var(--color-bone)]">{t.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-dim)]">{t.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}
