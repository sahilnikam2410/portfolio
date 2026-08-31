'use client';

import { coverage } from '@/data/content';
import { Section, Reveal } from './ui';

const STATUS = {
  detected: {
    label: 'detected',
    className: 'text-[var(--color-acid)] border-[rgba(53,255,158,0.35)]',
  },
  'gap→rule': {
    label: 'gap → rule',
    className: 'text-[#ffd166] border-[rgba(255,209,102,0.35)]',
  },
  research: {
    label: 'research',
    className: 'text-[var(--color-cyan)] border-[rgba(53,224,255,0.35)]',
  },
};

export default function Coverage() {
  const counts = coverage.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Section
      id="coverage"
      index="04"
      title="detection coverage"
      subtitle="Techniques executed in an owned lab, mapped to MITRE ATT&CK, then hunted from the defender side. Where nothing fired, that is recorded as a gap and the rule that closed it."
    >
      {/* summary strip */}
      <Reveal>
        <div className="mb-6 flex flex-wrap gap-px border border-[rgba(53,255,158,0.14)] bg-[rgba(53,255,158,0.14)]">
          <div className="flex-1 bg-[rgba(4,7,10,0.9)] px-4 py-3">
            <div className="text-xl text-[var(--color-acid)]">{coverage.length}</div>
            <div className="text-[11px] text-[var(--color-dim)]">techniques exercised</div>
          </div>
          {Object.entries(STATUS).map(([key, s]) => (
            <div key={key} className="flex-1 bg-[rgba(4,7,10,0.9)] px-4 py-3">
              <div className={`text-xl ${s.className.split(' ')[0]}`}>{counts[key] ?? 0}</div>
              <div className="text-[11px] text-[var(--color-dim)]">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* desktop table */}
      <Reveal delay={0.08}>
        <div className="hidden overflow-x-auto border border-[rgba(53,255,158,0.14)] lg:block">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(53,255,158,0.14)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-dim)]">
                <th className="px-4 py-3 font-normal">id</th>
                <th className="px-4 py-3 font-normal">technique</th>
                <th className="px-4 py-3 font-normal">tactic</th>
                <th className="px-4 py-3 font-normal">what was run</th>
                <th className="px-4 py-3 font-normal">what caught it</th>
                <th className="px-4 py-3 font-normal">status</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[rgba(53,255,158,0.08)] transition-colors last:border-0 hover:bg-[rgba(53,255,158,0.04)]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-cyan)]">{r.id}</td>
                  <td className="px-4 py-3 text-[var(--color-bone)]">
                    {r.technique}
                    <div className="text-[11px] text-[var(--color-dim)]">{r.where}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-dim)]">{r.tactic}</td>
                  <td className="px-4 py-3 text-[var(--color-dim)]">{r.run}</td>
                  <td className="px-4 py-3 text-[var(--color-dim)]">{r.signal}</td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap border px-2 py-0.5 text-[11px] ${STATUS[r.status].className}`}>
                      {STATUS[r.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {coverage.map((r, i) => (
          <Reveal key={r.id} delay={i * 0.04}>
            <div className="border border-[rgba(53,255,158,0.14)] bg-[rgba(8,13,18,0.72)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[var(--color-cyan)]">
                    {r.id} · {r.tactic}
                  </div>
                  <div className="mt-1 text-[15px] text-[var(--color-bone)]">{r.technique}</div>
                </div>
                <span className={`shrink-0 border px-2 py-0.5 text-[11px] ${STATUS[r.status].className}`}>
                  {STATUS[r.status].label}
                </span>
              </div>

              <dl className="mt-3 space-y-1.5 text-[12px] leading-relaxed">
                <div>
                  <dt className="inline text-[var(--color-acid)]">run: </dt>
                  <dd className="inline text-[var(--color-dim)]">{r.run}</dd>
                </div>
                <div>
                  <dt className="inline text-[var(--color-acid)]">caught by: </dt>
                  <dd className="inline text-[var(--color-dim)]">{r.signal}</dd>
                </div>
                <div>
                  <dt className="inline text-[var(--color-acid)]">where: </dt>
                  <dd className="inline text-[var(--color-dim)]">{r.where}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
