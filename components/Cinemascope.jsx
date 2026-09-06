'use client';

import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from './sceneStore';

/**
 * The film layer.
 *
 * The scene already had the photographic half of this — ACES tone mapping,
 * bloom, chromatic aberration, grain. What it did not have is the part that
 * actually reads as cinema rather than as a render: a frame that changes
 * shape, and a grade that changes with the beat.
 *
 * Three things, all DOM. None of it touches the render loop, because the
 * scene is already the expensive thing on the page and a colour wash has no
 * business costing frames.
 *
 *  1. Anamorphic bars. They close over the frame when the incident fires and
 *     open again after. A 2.39 crop held permanently would be a costume — it
 *     eats vertical space on a page whose job is to be read. Held for the one
 *     moment the page stops being a document and becomes a shot, it is the
 *     single most recognisable film signal there is.
 *
 *  2. An anamorphic streak. Horizontal, because that is the artefact a
 *     spherical lens cannot produce and an anamorphic one always does.
 *
 *  3. A grade that tracks the section. Cool and flat while reading, warm and
 *     contrastier at the attack. It sits above the scene and below the text,
 *     so it grades the picture without tinting a single word.
 */
export default function Cinemascope() {
  const alert = useSceneStore((s) => s.alert);
  const section = useSceneStore((s) => s.section);
  const [reduce, setReduce] = useState(true); // assume calm until told otherwise
  const wash = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (reduce) return null;

  const attack = section === 'coverage';

  return (
    <>
      {/* ── anamorphic bars ─────────────────────────────────────────
          Above the content on purpose: for the four seconds the incident
          runs, the page is a shot rather than a document. */}
      <div
        aria-hidden="true"
        data-print="hide"
        className="pointer-events-none fixed inset-x-0 top-0 z-[63] bg-black transition-[height] duration-[900ms] ease-[cubic-bezier(0.16,0.84,0.3,1)]"
        style={{ height: alert ? '7vh' : '0vh' }}
      />
      <div
        aria-hidden="true"
        data-print="hide"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[63] bg-black transition-[height] duration-[900ms] ease-[cubic-bezier(0.16,0.84,0.3,1)]"
        style={{ height: alert ? '7vh' : '0vh' }}
      />

      {/* ── anamorphic streak ───────────────────────────────────────
          Screen blend so it adds light rather than painting over it, and
          scaled from the centre so it arrives as a flare rather than a bar. */}
      <div
        aria-hidden="true"
        data-print="hide"
        className="pointer-events-none fixed inset-x-0 top-1/2 z-[62] h-px -translate-y-1/2 transition-[opacity,transform] duration-700 ease-out"
        style={{
          opacity: alert ? 0.55 : 0,
          transform: `translateY(-50%) scaleY(${alert ? 26 : 1})`,
          mixBlendMode: 'screen',
          background:
            'linear-gradient(90deg, transparent 0%, rgb(var(--cyan-rgb)/0.25) 22%, rgb(var(--acid-rgb)/0.75) 50%, rgb(var(--cyan-rgb)/0.25) 78%, transparent 100%)',
          filter: 'blur(6px)',
        }}
      />

      {/* ── the grade ───────────────────────────────────────────────
          -z-[3] puts it over the scene and under every word on the page. */}
      <div
        ref={wash}
        aria-hidden="true"
        data-print="hide"
        className="pointer-events-none fixed inset-0 -z-[3] transition-opacity duration-[1200ms] ease-out"
        style={{
          opacity: alert ? 0.5 : attack ? 0.32 : 0.16,
          mixBlendMode: 'soft-light',
          background: alert
            ? 'radial-gradient(ellipse at 50% 45%, rgb(var(--acid-rgb)/0.55) 0%, transparent 62%)'
            : attack
              ? 'radial-gradient(ellipse at 50% 55%, rgb(var(--acid-rgb)/0.35) 0%, rgb(var(--cyan-rgb)/0.12) 55%, transparent 78%)'
              : 'radial-gradient(ellipse at 50% 50%, rgb(var(--cyan-rgb)/0.22) 0%, transparent 70%)',
        }}
      />
    </>
  );
}
