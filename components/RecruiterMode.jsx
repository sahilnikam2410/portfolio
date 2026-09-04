'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { identity, resumes, socials, skills, certs, coverage, projects } from '@/data/content';
import CopyButton from './CopyButton';

/**
 * Everything a hiring decision needs, on one screen, with no scrolling and no
 * scene. The rest of the site is 10,000px of scroll — half the audience wants
 * the facts in fifteen seconds, and they should not have to earn them.
 */
export default function RecruiterMode() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'r') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const topSkills = skills.flatMap((g) => g.items.slice(0, 4));
  const detected = coverage.filter((c) => c.status === 'detected').length;

  return (
    <>
      {/* always-available entry point — not everyone reads keyboard hints */}
      <button
        onClick={() => setOpen(true)}
        data-print="hide"
        data-cursor="brief"
        className="fixed bottom-5 left-1/2 z-[64] -translate-x-1/2 border border-[rgba(53,255,158,0.3)] bg-[rgba(8,13,18,0.92)] px-4 py-2 text-[11px] text-[var(--color-dim)] backdrop-blur transition-colors hover:border-[var(--color-acid)] hover:text-[var(--color-acid)] lg:left-auto lg:right-5 lg:translate-x-0"
      >
        hiring? press <kbd className="text-[var(--color-acid)]">r</kbd> for the one-page brief
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            data-print="hide"
            className="fixed inset-0 z-[84] overflow-y-auto bg-[rgba(2,4,6,0.9)] backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto my-6 w-[min(96vw,1000px)] border border-[rgba(53,255,158,0.25)] bg-[rgba(6,10,14,0.98)]"
            >
              <div className="flex items-center justify-between border-b border-[rgba(53,255,158,0.16)] px-5 py-3">
                <span className="text-[12px] text-[var(--color-acid)]">candidate brief</span>
                <button
                  onClick={() => setOpen(false)}
                  className="border border-[rgba(53,255,158,0.25)] px-2 py-0.5 text-[11px] text-[var(--color-dim)] hover:text-[var(--color-acid)]"
                >
                  esc
                </button>
              </div>

              <div className="grid gap-px bg-[rgba(53,255,158,0.14)] lg:grid-cols-[1.15fr_0.85fr]">
                {/* left column */}
                <div className="space-y-5 bg-[rgba(6,10,14,0.98)] p-5">
                  <div>
                    <div className="text-2xl text-[var(--color-bone)]">{identity.name}</div>
                    <div className="mt-1 text-[13px] text-[var(--color-cyan)]">{identity.role}</div>
                    <div className="mt-1 text-[12px] text-[var(--color-dim)]">
                      {identity.location}
                    </div>
                    <div className="mt-2 inline-block border border-[rgba(53,255,158,0.3)] px-2 py-0.5 text-[11px] text-[var(--color-acid)]">
                      {identity.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-px border border-[rgba(53,255,158,0.14)] bg-[rgba(53,255,158,0.14)] sm:grid-cols-4">
                    {[
                      ['5/5', 'SOC modules certified'],
                      ['3 mo', 'enterprise SOC internship'],
                      ['8.53', 'B.Tech CGPA'],
                      [`${detected}`, 'techniques detected'],
                    ].map(([v, l]) => (
                      <div key={l} className="bg-[rgba(6,10,14,0.98)] px-3 py-2">
                        <div className="text-[16px] text-[var(--color-acid)]">{v}</div>
                        <div className="text-[10px] leading-tight text-[var(--color-dim)]">{l}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)]">
                      core tooling
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {topSkills.map((s) => (
                        <li
                          key={s}
                          className="border border-[rgba(53,255,158,0.18)] px-2 py-0.5 text-[11px] text-[var(--color-bone)]"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)]">
                      engagements
                    </div>
                    <ul className="space-y-1">
                      {projects.map((p) => (
                        <li key={p.id} className="text-[12px] leading-relaxed">
                          <span className="text-[var(--color-bone)]">{p.title}</span>
                          <span className="text-[var(--color-dim)]"> — {p.kind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* right column */}
                <div className="space-y-5 bg-[rgba(6,10,14,0.98)] p-5">
                  <div>
                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)]">
                      contact
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${identity.email}`}
                        className="text-[13px] text-[var(--color-acid)] hover:underline"
                      >
                        {identity.email}
                      </a>
                      <CopyButton value={identity.email} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={`tel:${identity.phone.replace(/\s/g, '')}`}
                        className="text-[13px] text-[var(--color-bone)] hover:underline"
                      >
                        {identity.phone}
                      </a>
                      <CopyButton value={identity.phone} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)]">
                      resume — pick the role
                    </div>
                    <ul className="space-y-px border border-[rgba(53,255,158,0.14)] bg-[rgba(53,255,158,0.14)]">
                      {resumes.map((r) => (
                        <li key={r.file}>
                          <a
                            href={r.file}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-3 bg-[rgba(6,10,14,0.98)] px-3 py-2 text-[12px] transition-colors hover:bg-[rgba(53,255,158,0.08)]"
                          >
                            <span className="text-[var(--color-bone)]">{r.role}</span>
                            <span className="text-[10px] text-[var(--color-dim)]">pdf ↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)]">
                      certifications
                    </div>
                    <ul className="space-y-1">
                      {certs.map((c) => (
                        <li key={c.name} className="text-[12px] leading-relaxed">
                          <span className="text-[var(--color-bone)]">{c.name}</span>
                          <span className="text-[var(--color-dim)]"> — {c.issuer}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-dim)]">
                      links
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {socials
                        .filter((s) => s.href.startsWith('http'))
                        .map((s) => (
                          <li key={s.label}>
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noreferrer"
                              className="border border-[rgba(53,224,255,0.25)] px-2 py-0.5 text-[11px] text-[var(--color-cyan)] hover:bg-[rgba(53,224,255,0.1)]"
                            >
                              {s.label} ↗
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(53,255,158,0.16)] px-5 py-3 text-[10px] text-[var(--color-dim)]">
                <span>every technique shown was run against systems he owns or was authorised to test</span>
                <button
                  onClick={() => window.print()}
                  className="ml-auto border border-[rgba(53,255,158,0.25)] px-2 py-0.5 hover:text-[var(--color-acid)]"
                >
                  print
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
