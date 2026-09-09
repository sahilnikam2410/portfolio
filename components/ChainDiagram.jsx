'use client';

import { useEffect, useRef, useState } from 'react';
import { COVERAGE_NODES, CHAIN } from './coverageLayout';
import { phaseAt, BEATS, CYCLE, LOOP_POS, LOOP_ID } from './killChain';

/**
 * The loop, for everyone who does not get the scene.
 *
 * The globe plays this same sequence, and a phone never sees it: the WebGL
 * layer is withheld on small screens because it measured 639 KB and a
 * Lighthouse performance score of 36 on the devices least able to afford
 * either. That decision stands — but it meant the one animation on this site
 * that argues rather than decorates was built for the minority of visitors,
 * and most traffic is a phone.
 *
 * So the argument comes down to flat SVG: a few hundred bytes of markup, no
 * library, reading its timing from the same phaseAt() the scene does, so the
 * two cannot drift about when the gap happens.
 *
 * Same claim as the globe, and no more: the loop runs on T1110 because that
 * is the only technique here with a published capture behind it.
 */

const W = 320;
const H = 108;
const PAD = 22;
const Y = 46;

const NODES = CHAIN.map((idx, i) => ({
  ...COVERAGE_NODES[idx],
  x: PAD + (i * (W - PAD * 2)) / (CHAIN.length - 1),
}));

export default function ChainDiagram() {
  const [frame, setFrame] = useState(() => phaseAt(0));
  const [still, setStill] = useState(false);
  const host = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // the finished state tells the same story without moving
      setStill(true);
      setFrame(phaseAt(CYCLE - 0.1));
      return;
    }

    let raf = 0;
    let t0 = 0;
    let running = false;

    // only run while it is on screen — an animation nobody is looking at is
    // just battery
    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting;
        if (running && !raf) {
          t0 = performance.now();
          raf = requestAnimationFrame(loop);
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    function loop(now) {
      if (!running) {
        raf = 0;
        return;
      }
      setFrame(phaseAt(((now - t0) / 1000) % CYCLE));
      raf = requestAnimationFrame(loop);
    }

    if (host.current) io.observe(host.current);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const label = BEATS.find((b) => b.name === frame.beat)?.label ?? '';
  const gapNode = NODES[LOOP_POS];
  const tone =
    frame.beat === 'gap'
      ? 'var(--color-acid)'
      : frame.fired > 0
      ? 'var(--color-acid)'
      : 'var(--color-cyan)';

  return (
    <div ref={host} className="mb-8 border border-[var(--edge)] bg-[var(--surface)] p-4 lg:hidden">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-dim)]">
        the loop — run, gap, rule, re-run
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`The detection loop for ${LOOP_ID}. A technique is run along the ATT&CK kill chain and reaches brute force, where nothing alerts and the gap is recorded. Rule 100211 is then written, the technique is run again, and the alert fires. The chain is drawn left to right in kill-chain order.`}
      >
        {/* links: drawn only as far as the pulse has carried */}
        {NODES.slice(0, -1).map((n, i) => {
          const reach = Math.max(0, Math.min(1, frame.head - i));
          const x2 = n.x + (NODES[i + 1].x - n.x) * reach;
          return (
            <g key={`l${i}`}>
              <line
                x1={n.x} y1={Y} x2={NODES[i + 1].x} y2={Y}
                stroke="rgb(var(--acid-rgb)/0.14)" strokeWidth="1"
              />
              {reach > 0.01 && (
                <line x1={n.x} y1={Y} x2={x2} y2={Y} stroke={tone} strokeWidth="1.6" />
              )}
            </g>
          );
        })}

        {/* the rule closing around the node that stayed dark */}
        {frame.rule > 0 && (
          <circle
            cx={gapNode.x} cy={Y} r={7 + (1 - frame.rule) * 9}
            fill="none"
            stroke={frame.fired > 0 ? 'var(--color-acid)' : '#ffd166'}
            strokeWidth="1.4"
            opacity={frame.rule * 0.9}
          />
        )}

        {NODES.map((n, i) => {
          const lit = frame.head >= i - 0.15;
          const isGap = i === LOOP_POS;
          const fill = isGap
            ? frame.beat === 'gap'
              ? '#ff5f57'
              : frame.fired > 0
              ? 'var(--color-acid)'
              : frame.rule > 0
              ? '#ffd166'
              : lit ? tone : 'rgb(var(--dim-rgb)/0.45)'
            : lit ? tone : 'rgb(var(--dim-rgb)/0.45)';
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={Y} r={isGap ? 4.5 : 3.4} fill={fill} />
              {/* The end labels sit on nodes at the edge of the viewBox, so
                  centring them puts half of "T1071.001" outside it. The two
                  ends hang inwards instead. */}
              <text
                x={n.x} y={Y - 13}
                textAnchor={i === 0 ? 'start' : i === NODES.length - 1 ? 'end' : 'middle'}
                fontSize="7.5"
                fill={lit ? 'var(--color-bone)' : 'rgb(var(--dim-rgb)/0.6)'}
                fontFamily="var(--font-mono)"
              >
                {n.id}
              </text>
            </g>
          );
        })}

        <text
          x={W / 2} y={H - 12}
          textAnchor="middle"
          fontSize="9"
          fill="var(--color-dim)"
          fontFamily="var(--font-mono)"
        >
          {still ? 'fired · captured 5 Sep 2026' : label}
        </text>
      </svg>
    </div>
  );
}
