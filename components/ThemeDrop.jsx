'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSceneStore } from './sceneStore';

// Lazily loaded: the figure and its 688 KB of geometry cost nothing until
// somebody actually changes palette, and never load at all for a visitor who
// does not.
const HeroDrop = dynamic(() => import('./HeroDrop'), { ssr: false });

/** Beats of the drop, in ms from the click. */
const FALL = 620; // silk pays out, spider descends
const LAND = 980; // it hits, the web bursts, the palette turns over
const GONE = 1900; // it climbs back out and the overlay unmounts

/**
 * The palette switch, as a set-piece.
 *
 * A theme toggle that simply repaints is a settings control. Dropping a
 * spider onto the page and turning the colours over at the moment it lands
 * makes the switch feel caused rather than configured — the page changes
 * because something arrived, not because a flag flipped.
 *
 * The timing is the whole trick. The palette turns over on the *impact*, not
 * on the click and not when the animation finishes: a colour change that
 * lands a beat early reads as a glitch, and one that lands late reads as lag.
 *
 * Everything here is DOM and CSS. It runs while the WebGL scene is rebuilding
 * itself for the new palette, which is exactly when the main thread is least
 * able to afford anything else.
 */
export default function ThemeDrop() {
  const switching = useSceneStore((s) => s.switching);
  const setSwitching = useSceneStore((s) => s.setSwitching);

  const [phase, setPhase] = useState('idle'); // idle | falling | landed
  const timers = useRef([]);

  useEffect(() => {
    if (!switching) return;

    /**
     * The theme is read here rather than subscribed to. This effect changes
     * the theme, so depending on it made the effect re-enter its own work:
     * the palette flipped, the effect re-ran, scheduled a second flip, and
     * turned it straight back — and the re-run reset the phase, so the burst
     * never rendered. Reading at fire time gives the current value with no
     * dependency on it.
     */
    const flip = () => {
      const { theme, setTheme } = useSceneStore.getState();
      setTheme(theme === 'spider' ? 'hacker' : 'spider');
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // no theatre, just the outcome
      flip();
      setSwitching(false);
      return;
    }

    setPhase('falling');

    const at = (ms, fn) => timers.current.push(window.setTimeout(fn, ms));

    at(LAND, () => {
      setPhase('landed');
      flip();
    });
    at(GONE, () => {
      setPhase('idle');
      setSwitching(false);
    });

    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [switching, setSwitching]);

  if (!switching || phase === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      data-print="hide"
      className="pointer-events-none fixed inset-0 z-[84] overflow-hidden"
    >
      {/* the figure, falling and landing on the beat */}
      <div className="absolute inset-0">
        <HeroDrop />
      </div>

      {/* the burst on impact: a web thrown outward from where it landed */}
      {phase === 'landed' && (
        <>
          <div className="spider-burst absolute left-1/2 top-[46vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-acid)]" />
          <div className="spider-flash absolute inset-0 bg-[var(--color-acid)]" />
        </>
      )}
    </div>
  );
}

export { FALL, LAND, GONE };
