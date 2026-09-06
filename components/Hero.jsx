'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <section id="top" className="relative flex min-h-screen items-center px-5 pt-28 pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* left: identity */}
        <div className="readable">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 border border-[rgba(53,255,158,0.28)] px-3 py-1.5 text-[11px] text-[var(--color-acid)]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-acid)] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-acid)]" />
            </span>
            {identity.status}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
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
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-3 text-sm text-[var(--color-cyan)] sm:text-base"
          >
            {identity.role}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="t-lead mt-7 text-[var(--color-dim)]"
          >
            {identity.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <a
                href="#work"
                data-cursor="open"
                className="block border border-[var(--color-acid)] bg-[rgba(53,255,158,0.1)] px-5 py-2.5 text-sm text-[var(--color-acid)] transition-colors hover:bg-[rgba(53,255,158,0.2)]"
              >
                ./view_work
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#shell"
                data-cursor="run"
                className="block border border-[rgba(53,255,158,0.2)] px-5 py-2.5 text-sm text-[var(--color-bone)] transition-colors hover:border-[var(--color-acid)]"
              >
                ./open_shell
              </a>
            </Magnetic>
            <span className="text-xs text-[var(--color-dim)]">{identity.location}</span>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 grid grid-cols-2 gap-px border border-[rgba(53,255,158,0.14)] bg-[rgba(53,255,158,0.14)] sm:grid-cols-4"
          >
            {stats.map((s) => (
              <li key={s.label} className="bg-[rgba(4,7,10,0.9)] px-4 py-3">
                <div className="t-num text-[var(--color-acid)]" style={{ fontSize: 'var(--step-2)' }}>
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] leading-[1.35] text-[var(--color-dim)]">{s.label}</div>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* right: live terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Panel className="shadow-[0_0_60px_rgba(53,255,158,0.07)]">
            <div className="flex items-center gap-2 border-b border-[rgba(53,255,158,0.14)] px-4 py-2.5">
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
                      className="border border-[rgba(53,224,255,0.25)] px-2.5 py-1 text-[11px] text-[var(--color-cyan)] transition-colors hover:bg-[rgba(53,224,255,0.1)]"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute inset-x-0 bottom-6 mx-auto w-fit text-[11px] text-[var(--color-dim)] transition-colors hover:text-[var(--color-acid)]"
      >
        scroll ↓
      </a>
    </section>
  );
}
