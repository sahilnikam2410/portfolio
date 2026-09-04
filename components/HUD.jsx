'use client';

import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from './sceneStore';

/** Corner telemetry: scroll depth, fps, hovered 3D node, pointer coords. */
export default function HUD() {
  const label = useSceneStore((s) => s.label);
  const [fps, setFps] = useState(60);
  const pctRef = useRef(null);
  const barRef = useRef(null);
  const coordRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let last = performance.now();

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      frames++;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      const p = useSceneStore.getState().progress;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}`.padStart(3, '0');
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e) => {
      if (coordRef.current) {
        coordRef.current.textContent = `x:${String(e.clientX).padStart(4, '0')} y:${String(
          e.clientY
        ).padStart(4, '0')}`;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <>
      {/* scroll progress rail */}
      <div data-print="hide" className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-px bg-[rgba(53,255,158,0.12)]">
        <div
          ref={barRef}
          className="h-full origin-left bg-[var(--color-acid)] shadow-[0_0_10px_var(--color-acid)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* left rail */}
      <div data-print="hide" className="pointer-events-none fixed bottom-5 left-5 z-[65] hidden select-none flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-dim)] lg:flex">
        <span>
          depth <span ref={pctRef} className="text-[var(--color-acid)]">000</span>
        </span>
        <span ref={coordRef}>x:0000 y:0000</span>
      </div>

      {/* right rail */}
      <div data-print="hide" className="pointer-events-none fixed bottom-5 right-5 z-[65] hidden select-none flex-col items-end gap-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-dim)] lg:flex">
        <span>
          <span className={fps < 40 ? 'text-[#ffd166]' : 'text-[var(--color-acid)]'}>{fps}</span> fps
        </span>
        <span className="text-[var(--color-cyan)]">{label ?? 'idle'}</span>
        <span>
          <kbd className="border border-[rgba(53,255,158,0.25)] px-1">ctrl</kbd>
          <span className="px-1">+</span>
          <kbd className="border border-[rgba(53,255,158,0.25)] px-1">k</kbd>
          <span className="px-1.5 text-[rgba(107,132,121,0.5)]">·</span>
          <kbd className="border border-[rgba(53,255,158,0.25)] px-1">?</kbd>
        </span>
      </div>
    </>
  );
}
