'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSceneStore } from './sceneStore';

/**
 * Eight legs, drawn once. Each is a curve from the body out to a knee and
 * down to a foot, mirrored across the midline and fanned front to back so the
 * front pair reaches forward and the back pair sweeps behind.
 *
 * Generated rather than hand-drawn: eight hand-tuned path strings would not
 * stay symmetric through a single edit.
 */
function legPaths() {
  const out = [];
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const hip = -3.2 + k * 2.3;
      const kneeX = side * (8.5 + k * 0.5);
      const kneeY = hip - 6.5 + k * 1.1;
      const footX = side * (12.5 + k * 1.5);
      const footY = hip + 3.5 + k * 2.7;
      out.push(`M ${side * 2.2} ${hip} Q ${kneeX} ${kneeY} ${footX} ${footY}`);
    }
  }
  return out;
}

/**
 * Crosshair reticle that snaps to interactive elements.
 *
 * In the spider palette the pointer itself becomes the spider: it turns to
 * face the way it is travelling and its legs scuttle, faster the quicker the
 * pointer moves. Everything is a transform write inside one rAF loop, so it
 * never re-renders React.
 */
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);
  const spider = useRef(null);
  const legs = useRef([]);

  const theme = useSceneStore((s) => s.theme);
  const isSpider = theme === 'spider';

  const paths = useMemo(() => legPaths(), []);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const state = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rx: window.innerWidth / 2,
      ry: window.innerHeight / 2,
      px: window.innerWidth / 2,
      py: window.innerHeight / 2,
      snap: null,
      scale: 1,
      target: 1,
      heading: 0,
      speed: 0,
      gait: 0,
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
    let last = performance.now();

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;

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

      if (spider.current) {
        const dx = state.x - state.px;
        const dy = state.y - state.py;
        const dist = Math.hypot(dx, dy);
        state.px = state.x;
        state.py = state.y;

        // Only re-aim while actually travelling. Below a few pixels the
        // direction is mostly jitter, and a spider that spins on the spot
        // while the hand rests reads as broken.
        if (dist > 1.5) {
          // the drawing faces up the screen, so north is the zero
          const want = Math.atan2(dy, dx) + Math.PI / 2;
          let diff = want - state.heading;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          state.heading += diff * 0.22;
        }

        state.speed += (Math.min(1, dist / 14) - state.speed) * 0.16;
        // gait advances with distance covered, not with time, so the legs
        // stop when the pointer stops instead of running on the spot
        state.gait += (0.9 + state.speed * 9) * dt * 6;

        spider.current.style.transform =
          `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) rotate(${state.heading}rad)`;

        for (let i = 0; i < legs.current.length; i++) {
          const leg = legs.current[i];
          if (!leg) continue;
          // opposite sides step out of phase, the way a real gait alternates
          const phase = (i % 4) * 0.8 + (i < 4 ? 0 : Math.PI);
          const swing = Math.sin(state.gait + phase) * (2.5 + state.speed * 13);
          leg.style.transform = `rotate(${swing}deg)`;
        }
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
  }, [isSpider]);

  return (
    <div aria-hidden="true" data-print="hide" className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 border border-[var(--color-acid)] transition-[opacity] duration-200"
        style={{ willChange: 'transform' }}
      />

      {isSpider ? (
        <svg
          ref={spider}
          viewBox="-22 -22 44 44"
          width="34"
          height="34"
          className="absolute left-0 top-0 overflow-visible text-[var(--color-acid)]"
          style={{ willChange: 'transform', filter: 'drop-shadow(0 0 5px var(--color-acid))' }}
        >
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
            {paths.map((d, i) => (
              <path
                key={d}
                d={d}
                ref={(el) => {
                  legs.current[i] = el;
                }}
                style={{ willChange: 'transform' }}
              />
            ))}
          </g>
          {/* abdomen behind, cephalothorax in front — the two-lobe silhouette
              is what separates a spider from a blob with legs */}
          <ellipse cx="0" cy="3.4" rx="3.6" ry="5" fill="currentColor" />
          <ellipse cx="0" cy="-3.2" rx="2.6" ry="3" fill="currentColor" />
        </svg>
      ) : (
        <div
          ref={dot}
          className="absolute left-0 top-0 h-1 w-1 rounded-full bg-[var(--color-acid)] shadow-[0_0_8px_var(--color-acid)]"
          style={{ willChange: 'transform' }}
        />
      )}

      <span
        ref={label}
        className="absolute left-0 top-0 text-[10px] uppercase tracking-[0.2em] text-[var(--color-acid)]"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
