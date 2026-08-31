# Portfolio — Sahil Anil Nikam

Next.js 15 (App Router) · React Three Fiber · custom GLSL · Tailwind v4 · Lenis · Zustand.
Dark SOC-terminal theme: holographic globe, GPU particle field, scroll-driven camera,
interactive shell, ⌘K palette.

## Run

```bash
npm run dev
```

http://localhost:3000

```bash
npm run build && npm start
```

## Make it yours

**`data/content.js` is the only file you normally edit.** Identity, resumes, socials,
stats, skills, projects, writeups, certs, timeline, ethics blurb and the hero boot
sequence all read from it.

| What | Where |
|---|---|
| Role-targeted CVs | `public/resumes/*.pdf` + the `resumes` array in `data/content.js` |
| Domain (OG/SEO) | `metadataBase` in `app/layout.js` |
| Colors | `@theme` block in `app/globals.css` |
| Shaders | `components/shaders.js` (globe, particle field, grid) |
| Camera path | `WAYPOINTS` in `components/Scene.jsx` |
| Shell commands | `createShell()` in `components/Terminal.jsx` |
| Palette entries | `items` in `components/CommandPalette.jsx` |

## What's in it

**WebGL (`components/Scene.jsx` + `shaders.js`)**
- Holographic globe: fresnel rim, drifting scanlines, simplex-noise surface pulse,
  and a horizontal tear that fires on an irregular glitch timer.
- 26k-point GPU particle field — all motion in the vertex shader, one draw call,
  pointer parallax weighted by depth, scroll pushes the field past the camera.
- 90 instanced nodes on the sphere with per-instance hover (reported to the HUD),
  10 dashed traffic arcs with a packet travelling along each curve.
- Shader ground grid with `fwidth`-based line AA and radial fade.
- Scroll-driven camera: six waypoints interpolated by document progress, damped,
  with pointer parallax layered on top.
- Post: bloom → chromatic aberration → scanline → noise → vignette.
- `PerformanceMonitor` scales DPR down on decline and back up on recovery.
  Low-core/small-screen devices get a lite scene; `prefers-reduced-motion` gets none.

**DOM layer**
- Boot preloader (fake decrypt/handshake sequence) before reveal.
- Custom crosshair cursor that snaps to any `a`, `button`, or `[data-cursor]`.
- Text that decrypts into place when it scrolls in (`Scramble`).
- Lenis momentum scrolling, anchor links routed through it.
- Corner HUD: scroll depth, live FPS, hovered 3D node, pointer coords.
- ⌘K / Ctrl-K command palette — sections, projects, links, CVs, copy-email.
- Interactive shell: real filesystem built from `content.js`, tab completion,
  `↑`/`↓` history, `ls`/`cd`/`cat`/`tree`, plus `nmap`, which refuses any target
  outside the lab ranges.

## Performance / accessibility

- WebGL disabled under `prefers-reduced-motion`; scramble, marquee and cursor also
  no-op there.
- Scene and cursor are `ssr: false` dynamic imports — nothing WebGL runs server-side.
- Scroll state lives in a Zustand store read via `getState()` inside `useFrame`, so
  scrolling never triggers a React render.

## Deploy

Push to GitHub → import into Vercel → no config needed. Then set `metadataBase`
to the real domain.
