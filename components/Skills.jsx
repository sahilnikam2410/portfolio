'use client';

import { skills, certs, coverage, projects } from '@/data/content';
import { Section, Panel, Reveal } from './ui';
import { useSceneStore } from './sceneStore';
import { coverageMatches, projectMatches } from '@/lib/match';

export default function Skills() {
  const focusTool = useSceneStore((s) => s.focusTool);
  const setFocusTool = useSceneStore((s) => s.setFocusTool);

  // a tool is only worth clicking if something on the page actually proves it
  const evidenceFor = (tool) =>
    coverage.filter((c) => coverageMatches(c, tool)).length +
    projects.filter((p) => projectMatches(p, tool)).length;

  const pick = (tool) => () => {
    const next = focusTool === tool ? null : tool;
    setFocusTool(next);
    if (!next) return;
    const el = document.getElementById('coverage');
    if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -80 });
    else el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Section
      id="skills"
      index="02"
      title="toolchain"
      subtitle="Grouped by where the evidence comes from — certification, internship, or lab. No self-scored percentages. Anything with a number beside it is clickable: it filters the detection coverage below to the work that proves it."
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
                {g.items.map((s) => {
                  const n = evidenceFor(s);
                  const active = focusTool === s;
                  return (
                    <li key={s}>
                      {n > 0 ? (
                        <button
                          onClick={pick(s)}
                          data-cursor={active ? 'clear' : 'evidence'}
                          title={`${n} piece${n === 1 ? '' : 's'} of evidence on this page`}
                          className={`border px-2 py-1 text-[11px] transition-colors ${
                            active
                              ? 'border-[var(--color-acid)] bg-[rgb(var(--acid-rgb)/0.12)] text-[var(--color-acid)]'
                              : 'border-[rgb(var(--acid-rgb)/0.16)] text-[var(--color-bone)] hover:border-[var(--color-acid)] hover:text-[var(--color-acid)]'
                          }`}
                        >
                          {s}
                          <span className="ml-1.5 text-[var(--color-dim)]">{n}</span>
                        </button>
                      ) : (
                        <span className="inline-block border border-[rgb(var(--acid-rgb)/0.08)] px-2 py-1 text-[11px] text-[var(--color-dim)]">
                          {s}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="mt-5 grid gap-px border border-[rgb(var(--acid-rgb)/0.14)] bg-[rgb(var(--acid-rgb)/0.14)] sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <div key={c.name} className="flex flex-col gap-1 bg-[rgba(8,13,18,0.85)] p-5">
              <div className="text-[14px] leading-snug text-[var(--color-bone)]">{c.name}</div>
              <div className="text-[12px] text-[var(--color-dim)]">{c.issuer}</div>
              <div className="mt-2 w-fit border border-[rgb(var(--cyan-rgb)/0.25)] px-2 py-0.5 text-[11px] text-[var(--color-cyan)]">
                {c.year}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
