'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSceneStore } from './sceneStore';

/**
 * A small orb web, drawn the same way the one in the scene is: radial strands
 * out from a hub, and rings that sag between them rather than sitting as true
 * circles. The sag is the whole difference between a web and a dartboard.
 */
function splatPaths(strands = 11, seed = 1) {
  // deterministic wobble, so a splat is irregular but not different every
  // render — React may draw the same one twice
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const spokes = [];
  const reach = [];
  for (let i = 0; i < strands; i++) {
    const a = (i / strands) * Math.PI * 2 + rnd() * 0.18;
    const r = 15 + rnd() * 7;
    reach.push({ a, r });
    spokes.push(`M 0 0 L ${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`);
  }

  const rings = [];
  for (const f of [0.45, 0.78]) {
    let d = '';
    for (let i = 0; i < strands; i++) {
      const A = reach[i];
      const B = reach[(i + 1) % strands];
      const ax = Math.cos(A.a) * A.r * f;
      const ay = Math.sin(A.a) * A.r * f;
      const bx = Math.cos(B.a) * B.r * f;
      const by = Math.sin(B.a) * B.r * f;
      // control point pulled toward the hub — that is the slack
      const mx = ((ax + bx) / 2) * 0.72;
      const my = ((ay + by) / 2) * 0.72;
      d += `${i === 0 ? `M ${ax.toFixed(2)} ${ay.toFixed(2)} ` : ''}Q ${mx.toFixed(2)} ${my.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)} `;
    }
    rings.push(d.trim());
  }

  return { spokes, rings };
}

/**
 * The motif layer for the spider palette: a web thrown where you click, the
 * spider-sense firing when the incident does, and a sling line whipping past
 * on a section change.
 *
 * All of it is decoration, so all of it is skipped for reduced motion and
 * hidden from print. These fire on discrete events — a click, an alert, a
 * section change — rather than per frame, so React state is the right tool
 * here in a way it is not for the cursor.
 */
export default function SpiderFx() {
  const theme = useSceneStore((s) => s.theme);
  const alert = useSceneStore((s) => s.alert);
  const section = useSceneStore((s) => s.section);

  const [reduce, setReduce] = useState(true); // assume calm until told otherwise
  const [splats, setSplats] = useState([]);
  const [sling, setSling] = useState(null);
  const seq = useRef(0);
  const sense = useRef(null);

  const on = theme === 'spider' && !reduce;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // ── a web where you click
  useEffect(() => {
    if (!on) return;
    const onDown = (e) => {
      const id = (seq.current += 1);
      // cap the list: a fast clicker should not stack dozens of live nodes
      setSplats((list) => [...list.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setSplats((list) => list.filter((p) => p.id !== id));
      }, 700);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [on]);

  // ── spider-sense rides the pointer, so it reads as the spider's own rather
  //    than a screen effect. Written straight to the transform: following a
  //    pointer through React state would re-render on every move.
  useEffect(() => {
    if (!on || !alert) return;
    const onMove = (e) => {
      if (sense.current) {
        sense.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [on, alert]);

  // ── a line whips past when the reader changes section
  useEffect(() => {
    if (!on) return;
    setSling({ id: (seq.current += 1), down: true });
    const t = window.setTimeout(() => setSling(null), 700);
    return () => window.clearTimeout(t);
  }, [section, on]);

  const web = useMemo(() => splatPaths(11, 7), []);

  if (!on) return null;

  return (
    <div
      aria-hidden="true"
      data-print="hide"
      className="pointer-events-none fixed inset-0 z-[68] overflow-hidden"
    >
      {/* web splats */}
      {splats.map((p) => (
        /* position on the wrapper, animation on the child: a keyframe that
           sets transform would otherwise overwrite the placement and every
           splat would play in the corner */
        <div
          key={p.id}
          className="absolute left-0 top-0"
          style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}
        >
        <svg
          className="spider-splat overflow-visible text-[var(--color-acid)]"
          width="1"
          height="1"
          viewBox="-24 -24 48 48"
        >
          <g
            stroke="currentColor"
            fill="none"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.9"
          >
            {web.spokes.map((d) => (
              <path key={d} d={d} />
            ))}
            {web.rings.map((d) => (
              <path key={d} d={d} strokeWidth="0.9" />
            ))}
          </g>
        </svg>
        </div>
      ))}

      {/* spider-sense: the arcs sit over the head, so they sit over the cursor */}
      {alert && (
        <div ref={sense} className="absolute left-1/2 top-1/2">
          <svg
            className="spider-sense overflow-visible text-[var(--color-acid)]"
            width="1"
            height="1"
            viewBox="-60 -60 120 120"
          >
            <g stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
              {[16, 26, 36, 46].map((r, i) => (
                <path
                  key={r}
                  d={`M ${-r * 0.72} ${-r * 0.6} A ${r} ${r} 0 0 1 ${r * 0.72} ${-r * 0.6}`}
                  style={{ animationDelay: `${i * 90}ms` }}
                />
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* sling line: one strand crossing the viewport on a section change */}
      {sling && (
        <svg
          key={sling.id}
          className="spider-sling absolute inset-0 h-full w-full text-[var(--color-acid)]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <line
            x1="-10"
            y1="-20"
            x2="60"
            y2="120"
            stroke="currentColor"
            strokeWidth="0.35"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
