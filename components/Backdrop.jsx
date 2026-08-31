'use client';

import dynamic from 'next/dynamic';

// The WebGL scene and the rain canvas are browser-only — never server-render them.
const Scene = dynamic(() => import('./Scene'), { ssr: false });
const MatrixRain = dynamic(() => import('./MatrixRain'), { ssr: false });

export default function Backdrop() {
  return (
    <>
      <Scene />
      <MatrixRain />
    </>
  );
}
