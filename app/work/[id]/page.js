import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects, caseStudies, identity, ethics } from '@/data/content';

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return {};
  return {
    title: `${project.title} — ${identity.name}`,
    description: project.summary,
    alternates: { canonical: `/work/${id}` },
    openGraph: {
      title: `${project.title} — ${identity.name}`,
      description: project.summary,
      url: `/work/${id}`,
    },
  };
}

function Block({ label, children }) {
  return (
    <section className="border-t border-[rgba(53,255,158,0.14)] py-8">
      <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[var(--color-acid)]">
        {label}
      </h2>
      {children}
    </section>
  );
}

export default async function CaseStudy({ params }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const study = caseStudies[id];

  return (
    <main className="relative min-h-screen px-5 pb-24 pt-24">
      <div className="grid-lines pointer-events-none fixed inset-0 -z-10 opacity-20" />

      <article className="mx-auto max-w-3xl">
        <Link
          href="/#work"
          className="text-[12px] text-[var(--color-dim)] transition-colors hover:text-[var(--color-acid)]"
        >
          ← cd ~/engagements
        </Link>

        <header className="mt-8">
          <div className="text-[11px] text-[var(--color-cyan)]">{project.kind}</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-bone)] sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-5 text-[15px] leading-[1.85] text-[var(--color-dim)]">
            {project.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li
                key={s}
                className="border border-[rgba(53,224,255,0.25)] px-2 py-0.5 text-[11px] text-[var(--color-cyan)]"
              >
                {s}
              </li>
            ))}
          </ul>
        </header>

        <div className="mt-10">
          {study?.objective && (
            <Block label="objective">
              <p className="text-[15px] leading-[1.85] text-[var(--color-bone)]">
                {study.objective}
              </p>
            </Block>
          )}

          {study?.environment?.length > 0 && (
            <Block label="environment">
              <ul className="flex flex-wrap gap-2">
                {study.environment.map((e) => (
                  <li
                    key={e}
                    className="border border-[rgba(53,255,158,0.18)] px-2.5 py-1 text-[12px] text-[var(--color-bone)]"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {study?.approach?.length > 0 && (
            <Block label="approach">
              <ol className="space-y-4">
                {study.approach.map((a, i) => (
                  <li key={i} className="flex gap-4 text-[14px] leading-[1.8]">
                    <span className="shrink-0 text-[var(--color-acid)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[var(--color-dim)]">{a}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {study?.outcome?.length > 0 && (
            <Block label="outcome">
              <ul className="space-y-3">
                {study.outcome.map((o, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-[1.8]">
                    <span className="text-[var(--color-acid)]">›</span>
                    <span className="text-[var(--color-dim)]">{o}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {study?.rules?.length > 0 && (
            <Block label="detection logic">
              <div className="space-y-6">
                {study.rules.map((r) => (
                  <figure key={r.title}>
                    <figcaption className="mb-2 text-[12px] text-[var(--color-cyan)]">
                      {r.title}
                      {r.lang && (
                        <span className="ml-2 text-[var(--color-dim)]">· {r.lang}</span>
                      )}
                    </figcaption>
                    <pre className="overflow-x-auto border border-[rgba(53,255,158,0.14)] bg-[rgba(4,7,10,0.85)] p-4 text-[12px] leading-relaxed text-[var(--color-bone)]">
                      <code>{r.code}</code>
                    </pre>
                    {r.note && (
                      <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-dim)]">
                        {r.note}
                      </p>
                    )}
                  </figure>
                ))}
              </div>
            </Block>
          )}

          {study?.artifacts?.length > 0 && (
            <Block label="artifacts">
              <div className="grid gap-4 sm:grid-cols-2">
                {study.artifacts.map((a) => (
                  <figure key={a.src} className="border border-[rgba(53,255,158,0.14)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.src} alt={a.alt} className="w-full" />
                    <figcaption className="border-t border-[rgba(53,255,158,0.14)] px-3 py-2 text-[11px] text-[var(--color-dim)]">
                      {a.alt}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Block>
          )}

          <Block label="highlights">
            <ul className="space-y-2">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-[14px] leading-[1.8]">
                  <span className="text-[var(--color-acid)]">$</span>
                  <span className="text-[var(--color-dim)]">{h}</span>
                </li>
              ))}
            </ul>
          </Block>

          {/* dev-only nudge: never rendered in production */}
          {process.env.NODE_ENV !== 'production' &&
            !study?.artifacts?.length &&
            !study?.rules?.length && (
              <Block label="todo — dev only">
                <p className="text-[13px] leading-relaxed text-[#ffd166]">
                  No artifacts or detection logic on this case study yet. Add screenshots to{' '}
                  <code>public/artifacts</code> and list them in{' '}
                  <code>caseStudies[&apos;{id}&apos;].artifacts</code>, and paste real rules into{' '}
                  <code>caseStudies[&apos;{id}&apos;].rules</code>. This block is hidden in
                  production.
                </p>
              </Block>
            )}

          <Block label="scope">
            <p className="text-[13px] leading-relaxed text-[var(--color-dim)]">{ethics.body}</p>
          </Block>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="border border-[rgba(53,255,158,0.35)] px-4 py-2 text-[13px] text-[var(--color-acid)] transition-colors hover:bg-[rgba(53,255,158,0.1)]"
            >
              repository →
            </a>
          )}
          <a
            href={`mailto:${identity.email}?subject=${encodeURIComponent(project.title)}`}
            className="border border-[rgba(53,255,158,0.2)] px-4 py-2 text-[13px] text-[var(--color-bone)] transition-colors hover:border-[var(--color-acid)]"
          >
            ask me about this
          </a>
        </div>
      </article>
    </main>
  );
}
