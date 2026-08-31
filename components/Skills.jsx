'use client';

import { skills, certs } from '@/data/content';
import { Section, Panel, Reveal } from './ui';

export default function Skills() {
  return (
    <Section
      id="skills"
      index="02"
      title="toolchain"
      subtitle="Grouped by where the evidence comes from — certification, internship, or lab. No self-scored percentages."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {skills.map((g, gi) => (
          <Reveal key={g.group} delay={gi * 0.08}>
            <Panel className="h-full p-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--color-acid)]">▸</span>
                <span className="text-[var(--color-cyan)]">{g.group}</span>
              </div>
              <div className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-dim)]">
                {g.evidence}
              </div>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <li
                    key={s}
                    className="border border-[rgba(53,255,158,0.16)] px-2 py-1 text-[11px] text-[var(--color-bone)] transition-colors hover:border-[var(--color-acid)] hover:text-[var(--color-acid)]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="mt-5 grid gap-px border border-[rgba(53,255,158,0.14)] bg-[rgba(53,255,158,0.14)] sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <div key={c.name} className="flex flex-col gap-1 bg-[rgba(8,13,18,0.85)] p-5">
              <div className="text-[14px] leading-snug text-[var(--color-bone)]">{c.name}</div>
              <div className="text-[12px] text-[var(--color-dim)]">{c.issuer}</div>
              <div className="mt-2 w-fit border border-[rgba(53,224,255,0.25)] px-2 py-0.5 text-[11px] text-[var(--color-cyan)]">
                {c.year}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
