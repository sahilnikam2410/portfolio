'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSceneStore } from './sceneStore';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/** Konami code → flattens the globe and drops a toast. Nothing else. */
export default function Konami() {
  const [fired, setFired] = useState(false);
  const setMorph = useSceneStore((s) => s.setMorph);

  useEffect(() => {
    let index = 0;

    const onKey = (e) => {
      // ignore while typing in the shell or the palette
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      index = key === SEQUENCE[index] ? index + 1 : key === SEQUENCE[0] ? 1 : 0;

      if (index === SEQUENCE.length) {
        index = 0;
        setFired(true);
        setMorph(1);
        setTimeout(() => setMorph(0), 4000);
        setTimeout(() => setFired(false), 5000);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMorph]);

  return (
    <AnimatePresence>
      {fired && (
        <motion.div
          key="konami"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-16 left-1/2 z-[75] -translate-x-1/2 border border-[rgba(53,255,158,0.35)] bg-[rgba(8,13,18,0.95)] px-5 py-3 text-[12px] text-[var(--color-acid)] shadow-[0_0_40px_rgba(53,255,158,0.15)]"
        >
          root shell granted — just kidding. try{' '}
          <span className="text-[var(--color-bone)]">sudo su</span> in the shell below.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
