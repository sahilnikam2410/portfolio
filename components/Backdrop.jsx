'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from './sceneStore';
import SceneBoundary from './SceneBoundary';

// Browser-only, and split out so three.js never lands in the initial payload.
const Scene = dynamic(() => import('./Scene'), { ssr: false });
const MatrixRain = dynamic(() => import('./MatrixRain'), { ssr: false });

/**
 * The scene is decoration, so it must never compete with the content.
 *
 * Two rules:
 *  1. Someone who will never see it does not download it. Reduced-motion
 *     users and anyone who set quality to "off" previously cost 254 KB of
 *     three.js, postprocessing and drei for a canvas that renders nothing.
 *  2. Everyone else gets it after the page is interactive, not during.
 *
 * Past the hero it fades and a scrim rises so body copy always wins on
 * contrast. That runs in a rAF loop writing styles directly — no renders.
 */
export default function Backdrop() {
  const layer = useRef(null);
  const scrim = useRef(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let saved = null;
    try {
      saved = localStorage.getItem('scene-quality');
    } catch {
      // storage blocked — fall through to capability detection
    }

    if (reduce || saved === 'off') return; // never fetch what will never render

    // wait for idle so the hero paints first; the timeout is the fallback
    // for browsers without requestIdleCallback (Safari)
    const start = () => setLoad(true);
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : setTimeout(start, 1200);

    return () => {
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const { progress, alert } = useSceneStore.getState();

      // 0 at the top, 1 once the hero is gone (~12% of the page)
      const past = Math.min(1, progress / 0.12);

      if (layer.current) {
        layer.current.style.opacity = String(alert ? 0.8 : 1 - past * 0.62);
      }
      if (scrim.current) {
        // enough of a pull-back to show the red globe, not so much that the
        // heading it sits behind stops being readable
        scrim.current.style.opacity = String(alert ? 0.55 : 0.18 + past * 0.62);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div ref={layer} className="fixed inset-0 -z-10">
        {/* always painted, so the page is never bare while the scene loads
            and stays correct if it never loads at all */}
        <div className="absolute inset-0 grid-lines opacity-30" />

        {load && (
          <SceneBoundary>
            <Scene />
            <MatrixRain />
          </SceneBoundary>
        )}
      </div>

      {/* readability scrim: sits above the scene, below all content */}
      <div
        ref={scrim}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[4] bg-[var(--color-void)]"
        style={{ opacity: 0.18 }}
      />
    </>
  );
}
