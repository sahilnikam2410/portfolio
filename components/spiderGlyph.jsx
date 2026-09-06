'use client';

import { useMemo } from 'react';

/**
 * Eight legs, generated rather than hand-drawn. Each is a curve from the body
 * out to a knee and down to a foot, mirrored across the midline and fanned
 * front to back so the front pair reaches forward and the back pair sweeps
 * behind.
 *
 * Generated because eight hand-tuned path strings would not stay symmetric
 * through a single edit.
 */
export function legPaths() {
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
 * The spider itself. Shared by the cursor and the palette switch so there is
 * one drawing on the site rather than two that drift apart.
 *
 * `legRef` hands each leg back to the caller, because the cursor articulates
 * them per frame and the drop animation does not.
 */
export function SpiderGlyph({ size = 44, legRef, className = '', style }) {
  const paths = useMemo(() => legPaths(), []);

  return (
    <svg
      viewBox="-22 -22 44 44"
      width={size}
      height={size}
      aria-hidden="true"
      className={`overflow-visible ${className}`}
      style={style}
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        {paths.map((d, i) => (
          <path key={d} d={d} ref={legRef ? (el) => legRef(el, i) : undefined} />
        ))}
      </g>
      {/* abdomen behind, cephalothorax in front — the two-lobe silhouette is
          what separates a spider from a blob with legs */}
      <ellipse cx="0" cy="3.4" rx="3.6" ry="5" fill="currentColor" />
      <ellipse cx="0" cy="-3.2" rx="2.6" ry="3" fill="currentColor" />
    </svg>
  );
}
