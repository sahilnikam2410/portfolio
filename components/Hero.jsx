'use client';

import { useEffect, useState } from 'react';
import { identity, stats, socials, terminalBoot } from '@/data/content';
import { Panel } from './ui';
import Magnetic from './Magnetic';

/** Types the boot sequence out line by line, then stops. */
function useBootSequence() {
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLines(
        terminalBoot.flatMap((s) => [
          { kind: 'cmd', text: s.cmd },
          ...s.out.map((o) => ({ kind: 'out', text: o })),
        ])
      );
      setDone(true);
      return;
    }

    let cancelled = false;
    const timers = [];
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));

    (async () => {
      await wait(350);
      for (const step of terminalBoot) {
        for (let i = 1; i <= step.cmd.length; i++) {
          if (cancelled) return;
          setTyping(step.cmd.slice(0, i));
          await wait(26);
        }
        await wait(180);
        if (cancelled) return;
        setTyping('');
        setLines((p) => [...p, { kind: 'cmd', text: step.cmd }]);
        for (const out of step.out) {
          await wait(90);
          if (cancelled) return;
          setLines((p) => [...p, { kind: 'out', text: out }]);
        }
        await wait(260);
      }
      if (!cancelled) setDone(true);
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return { lines, typing, done };
}

export default function Hero() {
  const { lines, typing, done } = useBootSequence();

  return (
    <section id="top" className="min-h-viewport relative flex items-center px-5 pt-24 pb-12 sm:pt-28 sm:pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* left: identity */}
        <div className="readable">
          <div className="anim-rise mb-4 inline-flex sm:mb-5 items-center gap-2 border border-[var(--edge-mid)] px-3 py-1.5 text-[11px] text-[var(--color-acid)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-acid)] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-acid)]" />
            </span>
            {identity.status}
          </div>

          {/* Plain h1 with a CSS entrance, not motion.h1. framer server-renders
              its initial state, so this shipped at opacity:0 and the biggest
              text on the page stayed invisible until hydration — 2.6s of LCP
              render delay. See .rise in globals.css. */}
          <h1 className="rise relative">
            {/* offset outline copy — must be w-full or it sizes to max-content
                and overflows instead of wrapping with the solid copy */}
            <span
              aria-hidden="true"
              className="display ghost pointer-events-none absolute left-0 top-0 w-full translate-x-[3px] translate-y-[3px] select-none"
            >
              {identity.name}
            </span>
            <span className="display flicker relative block text-[var(--color-bone)]">
              {identity.name}
              <span className="glow text-[var(--color-acid)]">.</span>
            </span>
          </h1>

          <p
            className="anim-rise mt-3 text-sm text-[var(--color-cyan)] sm:text-base"
            style={{ '--anim-delay': '0.16s' }}
          >
            {identity.role}
          </p>

          <p
            className="anim-rise t-lead mt-5 sm:mt-7 text-[var(--color-dim)]"
            style={{ '--anim-delay': '0.24s' }}
          >
            {identity.tagline}
          </p>

          <div
            className="anim-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ '--anim-delay': '0.32s' }}
          >
            <Magnetic>
              <a
                href="#work"
                data-cursor="open"
                className="block border border-[var(--color-acid)] bg-[rgb(var(--acid-rgb)/0.1)] px-5 py-2.5 text-sm text-[var(--color-acid)] transition-colors hover:bg-[rgb(var(--acid-rgb)/0.2)]"
              >
                ./view_work
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#shell"
                data-cursor="run"
                className="block border border-[var(--edge-mid)] px-5 py-2.5 text-sm text-[var(--color-bone)] transition-colors hover:border-[var(--color-acid)]"
              >
                ./open_shell
              </a>
            </Magnetic>
            <span className="text-xs text-[var(--color-dim)]">{identity.location}</span>
          </div>

          <ul
            className="anim-rise mt-7 grid grid-cols-2 sm:mt-10 gap-px border border-[var(--edge)] bg-[rgb(var(--acid-rgb)/0.14)] sm:grid-cols-4"
            style={{ '--anim-delay': '0.45s' }}
          >
            {stats.map((s) => {
              const value = (
                <div className="t-num text-[var(--color-acid)]" style={{ fontSize: 'var(--step-2)' }}>
                  {s.value}
                </div>
              );
              return (
                <li key={s.label} className="bg-[var(--surface-raised)] px-4 py-3">
                  {/* A figure that can cite itself should. Only one of these
                      has a public source; it links, the rest do not pretend
                      to. */}
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group/stat block"
                      title="Read the listing"
                    >
                      {value}
                      <span className="mt-1 block text-[11px] leading-[1.35] text-[var(--color-dim)] underline decoration-dotted underline-offset-2 group-hover/stat:text-[var(--color-acid)]">
                        {s.label} ↗
                      </span>
                    </a>
                  ) : (
                    <>
                      {value}
                      <div className="mt-1 text-[11px] leading-[1.35] text-[var(--color-dim)]">
                        {s.label}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* right: live terminal */}
        <div className="anim-rise" style={{ '--anim-delay': '0.2s' }}>
          <Panel className="shadow-[0_0_60px_rgb(var(--acid-rgb)/0.07)]">
            <div className="flex items-center gap-2 border-b border-[var(--edge)] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-acid)]" />
              <span className="ml-2 text-[11px] text-[var(--color-dim)]">
                sahil@lab: ~/portfolio — zsh
              </span>
            </div>

            <div className="h-[340px] overflow-hidden px-4 py-4 text-[13px] leading-relaxed sm:h-[400px]">
              {lines.map((l, i) =>
                l.kind === 'cmd' ? (
                  <div key={i} className="text-[var(--color-bone)]">
                    <span className="text-[var(--color-acid)]">sahil@lab</span>
                    <span className="text-[var(--color-dim)]">:~$ </span>
                    {l.text}
                  </div>
                ) : (
                  <div key={i} className="pl-0 text-[var(--color-dim)]">
                    {l.text}
                  </div>
                )
              )}

              {!done && (
                <div className="text-[var(--color-bone)]">
                  <span className="text-[var(--color-acid)]">sahil@lab</span>
                  <span className="text-[var(--color-dim)]">:~$ </span>
                  {typing}
                  <span className="caret text-[var(--color-acid)]">▊</span>
                </div>
              )}

              {done && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="border border-[rgb(var(--cyan-rgb)/0.25)] px-2.5 py-1 text-[11px] text-[var(--color-cyan)] transition-colors hover:bg-[rgb(var(--cyan-rgb)/0.1)]"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <a
        href="#about"
        className="tap absolute inset-x-0 bottom-6 mx-auto w-fit px-4 text-[11px] text-[var(--color-dim)] transition-colors hover:text-[var(--color-acid)]"
      >
        scroll ↓
      </a>
    </section>
  );
}
