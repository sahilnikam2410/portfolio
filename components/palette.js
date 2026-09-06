import * as THREE from 'three';

/**
 * Scene colours for each theme.
 *
 * The DOM re-themes through CSS custom properties, but WebGL cannot read
 * those, so the scene keeps its own copy of the same decisions.
 *
 * Spider notes:
 *  - `red` stays separate from `acid` even though both are red. `acid` is the
 *    resting accent; `red` only appears during the attack set-piece, so it has
 *    to out-shout a palette that is already red — hence the hotter, more
 *    saturated value.
 *  - `violet` becomes the classic suit blue. It only ever lights the scene, so
 *    it carries none of the contrast burden that ruled blue out for text.
 */
export const PALETTES = {
  hacker: {
    acid: '#35ff9e',
    cyan: '#35e0ff',
    amber: '#ffd166',
    red: '#ff5f57',
    violet: '#9b8cff',
    bone: '#d6efe3',
    void: '#04070a',
  },
  spider: {
    acid: '#ff2a3c',
    cyan: '#5b8cff',
    amber: '#ffd166',
    red: '#ff0033',
    violet: '#2b4fb8',
    bone: '#e8edf7',
    void: '#04070a',
  },
};

/**
 * These are mutated in place rather than replaced. Section states and the
 * per-frame lerps hold references to them, so moving a value here retools
 * every animation target at once.
 */
export const ACID = new THREE.Color();
export const CYAN = new THREE.Color();
export const AMBER = new THREE.Color();
export const RED = new THREE.Color();
export const VIOLET = new THREE.Color();

/** Plain hex, for the places that take a string prop. */
export const HEX = { ...PALETTES.hacker };

const KEYS = ['acid', 'cyan', 'amber', 'red', 'violet'];
const LIVE = { acid: ACID, cyan: CYAN, amber: AMBER, red: RED, violet: VIOLET };
const FROM = Object.fromEntries(KEYS.map((k) => [k, new THREE.Color()]));
const TO = Object.fromEntries(KEYS.map((k) => [k, new THREE.Color()]));

let t = 1; // 1 means settled
let target = PALETTES.hacker;

/** Set the palette immediately, with no travel. Used for the first paint. */
export function applyPalette(name) {
  const p = PALETTES[name] ?? PALETTES.hacker;
  KEYS.forEach((k) => LIVE[k].set(p[k]));
  Object.assign(HEX, p);
  target = p;
  t = 1;
  return p;
}

/**
 * Start the palette moving rather than switching.
 *
 * The canvas used to be rebuilt on a theme change so that materials and
 * uniforms were constructed in the new colours. That works, but it is a cut:
 * the scene disappears and a differently-coloured one takes its place, and the
 * only reason it was not obvious is that it happened under a flash.
 *
 * Travelling instead means every colour is interpolated for the length of the
 * move, so the globe, the web and the particles change *through* the switch
 * rather than being replaced by it.
 */
export function startPaletteTween(name) {
  const p = PALETTES[name] ?? PALETTES.hacker;
  KEYS.forEach((k) => {
    FROM[k].copy(LIVE[k]); // wherever we actually are, mid-move or not
    TO[k].set(p[k]);
  });
  target = p;
  t = 0;
}

/**
 * Advance the move. Returns true while it is still travelling, so callers can
 * skip the per-frame colour copying the rest of the time.
 *
 * The hex strings land at the end rather than being interpolated: they feed
 * props that only change on a render, and a string that updates every frame
 * without one is just garbage generated sixty times a second.
 */
export function tickPalette(delta, speed = 1.15) {
  if (t >= 1) return false;

  t = Math.min(1, t + delta * speed);
  const e = t * t * (3 - 2 * t); // ease, so it leaves and arrives softly
  KEYS.forEach((k) => LIVE[k].copy(FROM[k]).lerp(TO[k], e));

  if (t >= 1) Object.assign(HEX, target);
  return true;
}

/**
 * The app's entry point. The first call lands instantly — there is nothing to
 * travel from on a first paint, and easing in from the wrong colours would
 * just be a flicker on load. Every call after that travels.
 *
 * Kept here rather than in the component because a component cannot read or
 * write a ref during render, and this has to happen before the children read
 * the colours.
 */
let primed = false;
export function setPalette(name) {
  if (primed) startPaletteTween(name);
  else {
    primed = true;
    applyPalette(name);
  }
}

/** True while a palette move is in flight. */
export function paletteMoving() {
  return t < 1;
}

applyPalette('hacker');
