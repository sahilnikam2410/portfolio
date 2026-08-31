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
    let raf = 0;
    let value = 0;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      // ease toward 100 over ~2.2s, with jitter so it reads as real work
      const target = Math.min(100, (elapsed / 2200) * 100);
      value += (target - value) * 0.14 + Math.random() * 0.6;
      const clamped = Math.min(100, value);
      setPct(clamped);
      setStep(Math.min(STEPS.length - 1, Math.floor((clamped / 100) * STEPS.length)));

      if (clamped >= 99.4) {
        setBooted(true);
        setTimeout(() => setGone(true), 420);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [setBooted]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
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
