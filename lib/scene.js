/**
 * One answer to "is the 3D scene going to run on this visit".
 *
 * Backdrop already made this decision, but the preloader needed it too, and
 * two copies of a rule this fiddly drift apart. Both import it now.
 *
 * Three outcomes rather than a boolean, because "no scene" splits in two: a
 * visitor who said no gets nothing, while a visitor who was never asked gets
 * offered. Collapsing those loses the difference between a choice and a
 * default.
 *
 *   'load'  — start the scene
 *   'offer' — withhold it, show the control to turn it on
 *   'never' — withhold it, ask nothing; the visitor already answered
 *
 * Client-only. On the server it answers 'load', which is the shape the markup
 * is built for; the real decision lands on the first client pass.
 */
export function decideScene() {
  if (typeof window === 'undefined') return 'load';

  // ?scene=off — the auditable page, used by Lighthouse CI. Query only: it
  // writes nothing, so measuring the page never changes what the next real
  // visitor is served.
  try {
    if (new URLSearchParams(window.location.search).get('scene') === 'off') return 'never';
  } catch {
    // malformed query string — fall through to the normal path
  }

  let saved = null;
  let asked = null;
  try {
    saved = localStorage.getItem('scene-quality');
    asked = localStorage.getItem('scene-mobile');
  } catch {
    // storage blocked — fall through to capability detection
  }

  if (saved === 'off') return 'never'; // an explicit no stays no

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A width of zero means the page has not been laid out yet — a background
  // tab, or a pane still sizing itself. `max-width: 767px` matches that
  // happily, which would withhold the scene from a desktop that simply had
  // not measured itself. Trust a coarse pointer on its own; trust a width
  // only once there is one.
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const w = window.innerWidth;
  const small = coarse || (w > 0 && w < 768);

  if ((small || reduce) && asked !== 'on') return 'offer';

  return 'load';
}
