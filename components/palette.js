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
 * per-frame lerps hold references to them, so setting a new value here retools
 * every animation target at once. Anything that copies a colour instead of
 * holding it — uniform defaults, `setColorAt`, material props — is rebuilt by
 * remounting the canvas when the theme changes.
 */
export const ACID = new THREE.Color();
export const CYAN = new THREE.Color();
export const AMBER = new THREE.Color();
export const RED = new THREE.Color();
export const VIOLET = new THREE.Color();

/** Plain hex, for the places that take a string prop. */
export const HEX = { ...PALETTES.hacker };

export function applyPalette(name) {
  const p = PALETTES[name] ?? PALETTES.hacker;
  ACID.set(p.acid);
  CYAN.set(p.cyan);
  AMBER.set(p.amber);
  RED.set(p.red);
  VIOLET.set(p.violet);
  Object.assign(HEX, p);
  return p;
}

applyPalette('hacker');
