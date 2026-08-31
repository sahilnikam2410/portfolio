'use client';

import { create } from 'zustand';

/**
 * Shared state between the DOM layer and the WebGL layer.
 * Read inside useFrame with getState() so scroll never triggers a React render.
 */
export const useSceneStore = create((set) => ({
  progress: 0,     // 0..1 document scroll
  section: 'top',
  morph: 0,        // 0 = sphere, 1 = flattened disc
  label: null,     // hovered 3D node id, mirrored into the HUD
  booted: false,
  paletteOpen: false,

  setProgress: (progress) => set({ progress }),
  setSection: (section) => set({ section }),
  setMorph: (morph) => set({ morph }),
  setLabel: (label) => set({ label }),
  setBooted: (booted) => set({ booted }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
}));
