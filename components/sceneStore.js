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
  focusTool: null, // a tool clicked in the toolchain, filtering the evidence
  quality: 'auto', // auto | lite | off — user override, persisted
  theme: 'hacker', // hacker | spider — colour palette only, persisted
  booted: false,
  paletteOpen: false,

  setProgress: (progress) => set({ progress }),
  setSection: (section) => set({ section }),
  setAlert: (alert) => set({ alert }),
  setFocusTool: (focusTool) => set({ focusTool }),
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
  setTheme: (theme) => {
    try {
      localStorage.setItem('site-theme', theme);
    } catch {
      // private mode or blocked storage — the choice just does not persist
    }
    // the boot script in the document head reads the same attribute, so the
    // DOM and the store never disagree about which palette is showing
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  setBooted: (booted) => set({ booted }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
}));
