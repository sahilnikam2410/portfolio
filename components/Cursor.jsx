'use client';

import { useEffect, useRef } from 'react';

/**
 * Crosshair reticle that snaps to interactive elements.
 * Pure transform writes in a rAF loop — never re-renders React.
 */
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rx: window.innerWidth / 2,
      ry: window.innerHeight / 2,
      snap: null,
      scale: 1,
      target: 1,
    };

    const onMove = (e) => {
      state.x = e.clientX;
      state.y = e.clientY;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hit = el?.closest('a, button, [data-cursor]');
      if (hit) {
        const r = hit.getBoundingClientRect();
        state.snap = r;
        state.target = 1;
        if (label.current) {
          label.current.textContent = hit.dataset.cursor ?? '';
        }
      } else {
        state.snap = null;
        state.target = 1;
        if (label.current) label.current.textContent = '';
      }
    };

    const onDown = () => { state.target = 0.75; };
    const onUp = () => { state.target = 1; };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);

      // ring eases toward either the pointer or the snapped element box
      const tx = state.snap ? state.snap.left + state.snap.width / 2 : state.x;
      const ty = state.snap ? state.snap.top + state.snap.height / 2 : state.y;
      state.rx += (tx - state.rx) * 0.18;
      state.ry += (ty - state.ry) * 0.18;
      state.scale += (state.target - state.scale) * 0.2;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        const w = state.snap ? state.snap.width + 16 : 26;
        const h = state.snap ? state.snap.height + 14 : 26;
        ring.current.style.width = `${w}px`;
        ring.current.style.height = `${h}px`;
        ring.current.style.transform =
          `translate3d(${state.rx}px, ${state.ry}px, 0) translate(-50%, -50%) scale(${state.scale})`;
        ring.current.style.opacity = state.snap ? '1' : '0.55';
      }
      if (label.current) {
        label.current.style.transform =
          `translate3d(${state.x + 18}px, ${state.y + 16}px, 0)`;
      }
    };
    raf = requestAnimationFrame(loop);

    document.documentElement.style.cursor = 'none';

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <div aria-hidden="true" data-print="hide" className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 border border-[var(--color-acid)] transition-[opacity] duration-200"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1 w-1 rounded-full bg-[var(--color-acid)] shadow-[0_0_8px_var(--color-acid)]"
        style={{ willChange: 'transform' }}
      />
      <span
        ref={label}
        className="absolute left-0 top-0 text-[10px] uppercase tracking-[0.2em] text-[var(--color-acid)]"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
