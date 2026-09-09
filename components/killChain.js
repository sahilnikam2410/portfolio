import { COVERAGE_NODES, CHAIN } from './coverageLayout';

/**
 * The loop, rendered.
 *
 * The site's claim is a method, not a result: run the technique, check
 * whether the stack caught it, write the rule where it did not, run it
 * again. That was stated in prose everywhere and shown nowhere — the scene
 * traced the kill chain during the alert, but a chain lighting up end to end
 * says "everything works", which is the opposite of the point.
 *
 * So this plays the loop on the one technique that genuinely completed it.
 * T1110 is the only row on the site with a published capture: rule 100211
 * fired at level 12 on 5 Sep 2026 and the screenshot is in the repo. Every
 * label below is a fact from that run, not a caption invented to fit an
 * animation. Nothing here dramatises a detection that did not happen.
 *
 * Shared through a mutable module object rather than the store, the same way
 * the palette is: the links and the lattice both read it every frame, and
 * routing sixty updates a second through zustand would re-render the HUD for
 * an animation the DOM has no business knowing about.
 */

export const LOOP_ID = 'T1110';
export const LOOP_INDEX = COVERAGE_NODES.findIndex((n) => n.id === LOOP_ID);
/** where that technique sits along the chain, not in the data file */
export const LOOP_POS = Math.max(0, CHAIN.indexOf(LOOP_INDEX));

const LAST = CHAIN.length - 1;

/**
 * Beats, in seconds. The gap is held longer than it takes to read, because
 * it is the part everyone skips: the interesting half of this method is the
 * run that produced nothing.
 */
export const BEATS = [
  { name: 'run', at: 0, label: 'T1110 · brute force · running' },
  { name: 'gap', at: 2.6, label: 'no alert — recorded as a gap' },
  { name: 'rule', at: 4.6, label: 'rule 100211 written · level 12' },
  { name: 'rerun', at: 6.4, label: 're-run' },
  { name: 'fired', at: 8.8, label: 'fired · captured 5 Sep 2026' },
];
export const CYCLE = 11.4;

/**
 * head  — position along CHAIN the pulse has reached, in node indices
 * rule  — 0..1, how far the rule has been written in
 * fired — 0..1, the confirmation flash on the loop node
 */
export const chain = {
  t: 0,
  beat: 'idle',
  head: -1,
  rule: 0,
  fired: 0,
  playing: false,
};

const ease = (x) => 1 - Math.pow(1 - x, 3);
const span = (t, from, to) => Math.min(1, Math.max(0, (t - from) / (to - from)));

/**
 * The loop at a moment in time. Pure, so the WebGL scene and the flat SVG the
 * phones get can both read from it and cannot drift out of step — one is a
 * drawing of the other, and two copies of this timing would eventually
 * disagree about when the gap happens.
 */
export function phaseAt(t) {
  let beat = BEATS[0].name;
  for (const b of BEATS) if (t >= b.at) beat = b.name;

  if (t < BEATS[1].at) {
    // run: the pulse travels only as far as the technique under test
    return { beat, head: ease(span(t, 0, BEATS[1].at)) * LOOP_POS, rule: 0, fired: 0 };
  }
  if (t < BEATS[2].at) {
    // gap: it arrives and nothing happens. The chain stops here.
    return { beat, head: LOOP_POS, rule: 0, fired: 0 };
  }
  if (t < BEATS[3].at) {
    // rule: written at the node that stayed dark
    return { beat, head: LOOP_POS, rule: ease(span(t, BEATS[2].at, BEATS[3].at)), fired: 0 };
  }
  if (t < BEATS[4].at) {
    // re-run: from the top, and this time it carries past the gap
    return { beat, head: ease(span(t, BEATS[3].at, BEATS[4].at)) * LAST, rule: 1, fired: 0 };
  }
  // fired: the whole chain stands, and the node that closed confirms
  return { beat, head: LAST, rule: 1, fired: Math.min(1, span(t, BEATS[4].at, BEATS[4].at + 0.5)) };
}

/**
 * Advances the loop. `playing` is false whenever the coverage section is not
 * the one being read, and the clock resets rather than pausing — arriving at
 * the section should start the story, not drop the reader into its middle.
 */
export function tickChain(delta, playing) {
  if (!playing) {
    chain.playing = false;
    chain.t = 0;
    chain.beat = 'idle';
    chain.head = -1;
    chain.rule = 0;
    chain.fired = 0;
    return;
  }

  chain.playing = true;
  chain.t = (chain.t + delta) % CYCLE;
  Object.assign(chain, phaseAt(chain.t));
}

/** The label for the current beat, or null when the loop is not running. */
export function beatLabel() {
  if (!chain.playing) return null;
  const hit = BEATS.find((b) => b.name === chain.beat);
  return hit ? hit.label : null;
}
