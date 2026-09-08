'use client';

import dynamic from 'next/dynamic';
import SmoothScroll from './SmoothScroll';
import HUD from './HUD';
import SectionTracker from './SectionTracker';
import Cinemascope from './Cinemascope';
import ThemeDrop from './ThemeDrop';
import SpiderFx from './SpiderFx';

// browser-only extras
const Preloader = dynamic(() => import('./Preloader'), { ssr: false });
const Cursor = dynamic(() => import('./Cursor'), { ssr: false });

/**
 * These five are the last things importing framer-motion, and none of them is
 * on screen at load: a command palette, a konami easter egg, a settings
 * panel, an alert toast and the recruiter brief. Statically imported, they
 * pulled the whole animation library into the first chunk the browser has to
 * parse — which is what the remaining LCP was waiting on, since the headline
 * itself now paints off the stylesheet.
 *
 * Split out, framer lands in a chunk fetched after hydration, and every one
 * of these still opens instantly when its key or button is used.
 */
const CommandPalette = dynamic(() => import('./CommandPalette'), { ssr: false });
const Konami = dynamic(() => import('./Konami'), { ssr: false });
const Controls = dynamic(() => import('./Controls'), { ssr: false });
const AlertFlash = dynamic(() => import('./AlertFlash'), { ssr: false });
const RecruiterMode = dynamic(() => import('./RecruiterMode'), { ssr: false });

/** Everything that sits on top of the page: boot screen, cursor, HUD, ⌘K. */
export default function Chrome() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <HUD />
      <CommandPalette />
      <Konami />
      <Controls />
      <SectionTracker />
      <Cinemascope />
      <ThemeDrop />
      <AlertFlash />
      <SpiderFx />
      <RecruiterMode />
    </>
  );
}
