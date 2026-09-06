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

    // Eased rather than assigned, so arriving at a beat reveals the scene
    // instead of snapping to it. Started at the top-of-page values.
    const cur = { layer: 1, scrim: 0.18 };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const { progress, alert, section } = useSceneStore.getState();

      // 0 at the top, 1 once the hero is gone (~12% of the page)
      const past = Math.min(1, progress / 0.12);

      /**
       * The coverage beat is the one shot on the page worth looking at: the
       * camera drops low and the lens opens to 66. It was also sitting behind
       * the heaviest scrim the page applies, and the only thing that pulled
       * that scrim back was the alert — which fires once per visit and lasts
       * four seconds. Scrolling there at any other moment left the shot at
       * roughly seven per cent visibility, which is to say invisible.
       *
       * The section holds the scrim back now, and the alert takes it further
       * still, so the set-piece has somewhere left to go.
       */
      const attack = section === 'coverage';
      const layerTo = alert ? 0.92 : attack ? 0.78 : 1 - past * 0.62;
      const scrimTo = alert ? 0.42 : attack ? 0.56 : 0.18 + past * 0.62;

      cur.layer += (layerTo - cur.layer) * 0.05;
      cur.scrim += (scrimTo - cur.scrim) * 0.05;

      if (layer.current) layer.current.style.opacity = String(cur.layer);
      if (scrim.current) scrim.current.style.opacity = String(cur.scrim);
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
