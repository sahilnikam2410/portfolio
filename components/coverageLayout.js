import * as THREE from 'three';
import { coverage } from '@/data/content';

/**
 * Enterprise tactics in kill-chain order. The same list the table renders its
 * columns from — kept here rather than imported so the scene does not depend
 * on a DOM component, but it must stay in step with it: a technique whose
 * tactic is not in this list would have nowhere to sit.
 */
export const TACTICS = [
  'Reconnaissance',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command & Control',
  'Exfiltration',
  'Impact',
];

/**
 * Where each technique sits on the globe.
 *
 * The scene used to pick a node for a hovered row with `(index * 13) % 90` —
 * an arbitrary dot, labelled `node_007`. It looked like the table and the
 * globe were connected while telling the reader nothing.
 *
 * Position now carries meaning. Longitude is the tactic's place in the kill
 * chain, so the scene reads left to right the way the table does. Latitude
 * separates techniques that share a tactic — two Initial Access rows would
 * otherwise land on the same point.
 *
 * Positions are computed once at module load: the coverage list is static
 * content, and recomputing trigonometry every frame for six points would be
 * work for its own sake.
 */
function layout() {
  // how many techniques already claimed each tactic, so repeats can be spread
  const seen = new Map();

  return coverage.map((row) => {
    const col = Math.max(0, TACTICS.indexOf(row.tactic));
    const dup = seen.get(row.tactic) ?? 0;
    seen.set(row.tactic, dup + 1);

    // kill chain wraps three quarters of the way round, leaving the back of
    // the globe clear so the front reads as a sequence rather than a ring
    const lon = (col / (TACTICS.length - 1)) * Math.PI * 1.5 - Math.PI * 0.75;

    // stagger repeats above and below the equator: 0, +1, -1, +2 …
    const step = dup === 0 ? 0 : Math.ceil(dup / 2) * (dup % 2 === 1 ? 1 : -1);
    const lat = step * 0.42 + Math.sin(col * 1.7) * 0.12;

    return {
      ...row,
      position: new THREE.Vector3(
        Math.cos(lat) * Math.sin(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.cos(lon)
      ),
      col,
    };
  });
}

export const COVERAGE_NODES = layout();

/**
 * The order an attack is traced in: kill-chain order, not the order the rows
 * happen to be written in. A chain that jumps backwards through the tactics
 * is not a chain.
 */
export const CHAIN = COVERAGE_NODES.map((n, i) => i).sort(
  (a, b) => COVERAGE_NODES[a].col - COVERAGE_NODES[b].col
);
