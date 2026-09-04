'use client';

import dynamic from 'next/dynamic';
import SmoothScroll from './SmoothScroll';
import HUD from './HUD';
import CommandPalette from './CommandPalette';
import Konami from './Konami';

// browser-only extras
const Preloader = dynamic(() => import('./Preloader'), { ssr: false });
const Cursor = dynamic(() => import('./Cursor'), { ssr: false });

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
    </>
  );
}
