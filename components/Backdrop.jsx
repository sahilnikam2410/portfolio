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
 * Three rules:
 *  1. Someone who will never see it does not download it. Reduced-motion
 *     users and anyone who set quality to "off" previously cost 254 KB of
 *     three.js, postprocessing and drei for a canvas that renders nothing.
 *  2. Nobody is left with nothing. Whenever the scene is withheld the page
 *     still paints a backdrop of its own and offers a way to turn the scene
 *     on, because a blank page with no control reads as broken.
 *  3. Everyone else gets it after the page is interactive, not during.
 *
 * Past the hero it fades and a scrim rises so body copy always wins on
 * contrast. That runs in a rAF loop writing styles directly — no renders.
 */
export default function Backdrop() {
  const layer = useRef(null);
  const scrim = useRef(null);
  const [load, setLoad] = useState(false);
  const [offer, setOffer] = useState(false); // small screen, scene not taken up

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let saved = null;
    let asked = null;
    try {
      saved = localStorage.getItem('scene-quality');
      asked = localStorage.getItem('scene-mobile');
    } catch {
      // storage blocked — fall through to capability detection
    }

    if (saved === 'off') return; // an explicit no stays no

    /**
     * Phones were downloading 639 KB of three.js and then rendering the
     * reduced scene anyway, because a small screen drops to "lite" — but only
     * after the payload has already landed. That is the worst of both: the
     * full cost of the scene and a degraded version of it, on the devices
     * least able to afford either. It measured 36 on mobile.
     *
     * So a phone gets the fast page and an offer instead of an ambush. The
     * scene is one tap away and the choice sticks, rather than being decided
     * for someone on a train.
     */
    // A width of zero means the page has not been laid out yet — a background
    // tab, or a pane still sizing itself. `max-width: 767px` matches that
    // happily, which would withhold the scene from a desktop that simply had
    // not measured itself. Trust a coarse pointer on its own; trust a width
    // only once there is one.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const w = window.innerWidth;
    const small = coarse || (w > 0 && w < 768);

    /**
     * Reduced motion used to return here with nothing shown and nothing
     * offered — no scene, and no control to ask for one. On a phone with the
     * system setting on, which is common, that left a flat page and no way
     * back from it. The setting is still honoured: the scene never starts on
     * its own. It is offered instead, and an explicit tap outranks a default,
     * the same way it does for a small screen.
     */
    if ((small || reduce) && asked !== 'on') {
      setOffer(true);
      return;
    }

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

  const takeUpOffer = () => {
    try {
      localStorage.setItem('scene-mobile', 'on');
    } catch {
      // storage blocked — the scene still starts, the choice just won't stick
    }
    setOffer(false);
    setLoad(true);
  };

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
       *
       * 0.65 rather than the 0.56 first tried: at 0.56 the shot read well but
       * the body copy over it did not, and this section carries the densest
       * text on the page. The scene is decoration and the table is the point,
       * so the text wins the argument.
       */
      const attack = section === 'coverage';
      const layerTo = alert ? 0.92 : attack ? 0.78 : 1 - past * 0.62;
      const scrimTo = alert ? 0.42 : attack ? 0.65 : 0.18 + past * 0.62;

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
        {/* Painted whether or not the scene ever loads, so the page is never
            bare while it arrives and stays right if it never does. Without
            the wash, a visitor who declines the scene — or whose phone asks
            for reduced motion — got flat black, which reads as broken rather
            than as a choice. */}
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 60% at 50% 32%, rgb(var(--acid-rgb)/0.10) 0%, transparent 62%), radial-gradient(ellipse 70% 50% at 78% 78%, rgb(var(--cyan-rgb)/0.08) 0%, transparent 60%)',
          }}
        />

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

      {/* The offer. Small, out of the reading column, and gone for good once
          answered — a phone should not be nagged about decoration. */}
      {offer && (
        <button
          type="button"
          onClick={takeUpOffer}
          data-print="hide"
          className="fixed bottom-4 left-4 z-[71] border border-[rgb(var(--acid-rgb)/0.35)] bg-[rgba(4,7,10,0.9)] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--color-acid)] backdrop-blur-sm"
        >
          enable 3D scene
        </button>
      )}
    </>
  );
}
