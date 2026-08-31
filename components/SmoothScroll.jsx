'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/** Momentum scrolling. Anchor links are routed through Lenis so they ease too. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let raf = 0;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -80 });
    };
    document.addEventListener('click', onClick);

    // let other components drive it
    window.__lenis = lenis;

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
