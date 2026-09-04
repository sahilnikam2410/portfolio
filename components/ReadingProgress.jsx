'use client';

import { useEffect, useRef } from 'react';

/** Thin progress rail for long-form pages. Writes transform directly, no renders. */
export default function ReadingProgress() {
  const bar = useRef(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      data-print="hide"
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-px bg-[rgba(53,255,158,0.12)]"
    >
      <div
        ref={bar}
        className="h-full origin-left bg-[var(--color-acid)] shadow-[0_0_10px_var(--color-acid)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
