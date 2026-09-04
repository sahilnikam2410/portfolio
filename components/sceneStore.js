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
  highlight: -1,   // coverage row index currently hovered in the DOM
  alert: false,    // fires the attack set-piece when coverage enters view
  quality: 'auto', // auto | lite | off — user override, persisted
  booted: false,
  paletteOpen: false,

  setProgress: (progress) => set({ progress }),
  setSection: (section) => set({ section }),
  setAlert: (alert) => set({ alert }),
  setMorph: (morph) => set({ morph }),
  setLabel: (label) => set({ label }),
  setHighlight: (highlight) => set({ highlight }),
  setQuality: (quality) => {
    try {
      localStorage.setItem('scene-quality', quality);
    } catch {
      // private mode or blocked storage — the choice just does not persist
    }
    set({ quality });
  },
  setBooted: (booted) => set({ booted }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
}));
