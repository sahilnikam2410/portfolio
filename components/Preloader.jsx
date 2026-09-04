'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneStore } from './sceneStore';

const STEPS = [
  'mounting /dev/portfolio',
  'verifying signature — ed25519',
  'decrypting payload (aes-256-gcm)',
  'initialising webgl context',
  'compiling shaders  [holo, field, grid]',
  'linking scene graph',
  'handshake complete',
];

export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const [gone, setGone] = useState(false);
  const setBooted = useSceneStore((s) => s.setBooted);

  useEffect(() => {
    const DURATION = 2200;
    const start = performance.now();
    let raf = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setPct(100);
      setStep(STEPS.length - 1);
      setBooted(true);
      setTimeout(() => setGone(true), 420);
    };

    /**
     * Progress is derived from wall-clock time, not accumulated per frame.
     * rAF throttles to a crawl in a background tab, and a frame-counted bar
     * would still be at 80% when someone returns from another tab — a loading
     * screen that is not loading anything. The hard timeout below finishes the
     * boot even if no frame ever runs.
     */
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out, with a little jitter so it reads as real work
      const eased = 1 - Math.pow(1 - t, 2.2);
      const value = Math.min(99.9, eased * 100 + (t < 1 ? Math.random() * 0.8 : 0));

      setPct(value);
      setStep(Math.min(STEPS.length - 1, Math.floor((value / 100) * STEPS.length)));

      if (t >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const guard = setTimeout(finish, DURATION + 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(guard);
    };
  }, [setBooted]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--color-void)] px-6"
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative w-full max-w-md">
            <div className="mb-6 flex items-baseline justify-between text-[11px] text-[var(--color-dim)]">
              <span className="text-[var(--color-acid)]">SECURE BOOT</span>
              <span>{Math.floor(pct).toString().padStart(3, '0')}%</span>
            </div>

            <div className="h-[2px] w-full bg-[rgba(53,255,158,0.15)]">
              <div
                className="h-full bg-[var(--color-acid)] shadow-[0_0_12px_var(--color-acid)]"
                style={{ width: `${pct}%` }}
              />
            </div>

            <ul className="mt-6 space-y-1.5 text-[12px]">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={
                    i < step
                      ? 'text-[var(--color-dim)]'
                      : i === step
                      ? 'text-[var(--color-bone)]'
                      : 'text-[rgba(107,132,121,0.3)]'
                  }
                >
                  <span className="text-[var(--color-acid)]">
                    {i < step ? '[ok]' : i === step ? '[..]' : '[  ]'}
                  </span>{' '}
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[var(--color-dim)]">
              lab environment · isolated · authorised targets only
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
