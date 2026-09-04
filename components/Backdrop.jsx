'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useSceneStore } from './sceneStore';

// The WebGL scene and the rain canvas are browser-only — never server-render them.
const Scene = dynamic(() => import('./Scene'), { ssr: false });
const MatrixRain = dynamic(() => import('./MatrixRain'), { ssr: false });

/**
 * The scene is the hero's subject; past the hero it becomes wallpaper.
 * Fade it out and raise a scrim so body copy always wins on contrast.
 * Driven by a rAF loop writing styles directly — no React renders on scroll.
 */
export default function Backdrop() {
  const layer = useRef(null);
  const scrim = useRef(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const { progress, alert } = useSceneStore.getState();

      // 0 at the top, 1 once the hero is gone (~12% of the page)
      const past = Math.min(1, progress / 0.12);

      // during the incident the scene is the point — pull the scrim back
      // so the red globe and shockwaves are actually visible
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
        <Scene />
        <MatrixRain />
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
