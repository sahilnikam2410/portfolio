'use client';

import { identity, socials, resumes } from '@/data/content';
import { Section, Panel, Reveal } from './ui';
import { track } from '@vercel/analytics';
import CopyButton from './CopyButton';

export default function Contact() {
  return (
    <Section
      id="contact"
      index="06"
      title="establish connection"
      subtitle="Hiring, contract testing, or a question about something I published — all fine."
    >
      <Reveal>
        <Panel className="p-8 sm:p-12">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="text-[13px] text-[var(--color-dim)]">
                <span className="text-[var(--color-acid)]">sahil@lab</span>:~$ ./connect --to you
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${identity.email}`}
                  className="glow inline-block break-all text-2xl text-[var(--color-acid)] transition-opacity hover:opacity-80 sm:text-4xl"
                >
                  {identity.email}
                </a>
                <CopyButton value={identity.email} />
              </div>
              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[var(--color-dim)]">
                Fastest reply is email — {identity.phone} works too. Include the role or the target
                scope and I will tell you straight whether I am the right fit.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${identity.email}`}
                  data-cursor="send"
                  className="border border-[var(--color-acid)] bg-[rgb(var(--acid-rgb)/0.1)] px-5 py-2.5 text-sm text-[var(--color-acid)] transition-colors hover:bg-[rgb(var(--acid-rgb)/0.2)]"
                >
                  send mail
                </a>
                <a
                  href={`tel:${identity.phone.replace(/\s/g, '')}`}
                  className="border border-[rgb(var(--acid-rgb)/0.2)] px-5 py-2.5 text-sm text-[var(--color-bone)] transition-colors hover:border-[var(--color-acid)]"
                >
                  {identity.phone}
                </a>
                <CopyButton value={identity.phone} label="copy number" className="self-center" />
              </div>

              {/* role-targeted CVs — recruiters grab the one that matches the req */}
              <div className="mt-10">
                <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">
                  resume — pick the role
                </div>
                <ul className="grid gap-px border border-[rgb(var(--acid-rgb)/0.14)] bg-[rgb(var(--acid-rgb)/0.14)] sm:grid-cols-2">
                  {resumes.map((r) => (
                    <li key={r.file}>
                      <a
                        href={r.file}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="pdf"
                        onClick={() => track('resume_download', { role: r.role })}
                        className="flex h-full flex-col justify-between gap-1 bg-[rgba(4,7,10,0.92)] px-4 py-3 transition-colors hover:bg-[rgb(var(--acid-rgb)/0.08)]"
                      >
                        <span className="text-[13px] text-[var(--color-bone)]">{r.role}</span>
                        <span className="text-[11px] text-[var(--color-dim)]">{r.note}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ul className="space-y-px self-start border border-[rgb(var(--acid-rgb)/0.14)] bg-[rgb(var(--acid-rgb)/0.14)]">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 bg-[rgba(4,7,10,0.9)] px-4 py-3 text-[13px] transition-colors hover:bg-[rgb(var(--acid-rgb)/0.08)]"
                  >
                    <span className="text-[var(--color-bone)]">{s.label}</span>
                    <span className="truncate text-[11px] text-[var(--color-dim)]">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}
