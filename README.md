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
| Case studies | `caseStudies` in `data/content.js` → rendered at `/work/<id>` |
| Screenshots | drop in `public/artifacts`, list in `caseStudies[id].artifacts` |
| Repo links | set `repo:` (or `site:`) on a project — the button only renders if present |

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
  `↑`/`↓` history, `ls`/`cd`/`cat`/`tree`, `resume`, `hire`, plus `nmap`, which
  refuses any target outside the lab ranges.
- Hovering a detection-coverage row lights the node it maps to in the 3D scene.
- Case-study pages at `/work/<id>`, statically generated, one per engagement.
- Konami code flattens the globe. `sudo su` in the shell has an opinion.
- Vercel Analytics, terminal-styled 404, generated OG card, sitemap, robots.

## Security posture

The site ships hardened because a security portfolio gets graded on it:

- CSP, HSTS (preload), `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, COOP — all in `next.config.mjs`.
- `poweredByHeader: false` — no framework version disclosure.
- `/.well-known/security.txt` per RFC 9116.
- schema.org `Person` JSON-LD for search engines.

`script-src` carries `'unsafe-inline'`. That is deliberate and documented in
`next.config.mjs`: the site is fully prerendered, and the strict alternative —
a per-request nonce from middleware — forces every page into dynamic rendering.
For a static site with no input, no auth and no sessions, the trade is not worth
it. Know the tradeoff you are making; do not inherit it by accident.

Verify after deploying:

```bash
curl -sI https://your-domain.com | grep -i -E 'content-security|strict-transport|x-frame|referrer|permissions'
```

## Keyboard

`?` opens the shortcut sheet. `j`/`k` walk sections, `g`/`G` jump to the ends,
`/` focuses the shell, `q` cycles scene quality (full · lite · off, persisted to
localStorage), `p` prints, `ctrl+k` opens the palette.

`Ctrl+P` produces a clean ink-on-white document — the scene, HUD, cursor,
marquee and shell are dropped, and external link targets are printed inline.

## Checks

```bash
npm run lint
npm run build
```

`react-hooks/set-state-in-effect` is off by design — several components read
browser-only state (`matchMedia`, `hardwareConcurrency`, element geometry) that
does not exist during render, so the first paint is corrected from an effect.
All scene geometry uses a seeded PRNG rather than `Math.random()`, so a
double-render under concurrent React produces an identical scene.

## Performance / accessibility

- WebGL disabled under `prefers-reduced-motion`; scramble, marquee and cursor also
  no-op there.
- Scene and cursor are `ssr: false` dynamic imports — nothing WebGL runs server-side.
- Scroll state lives in a Zustand store read via `getState()` inside `useFrame`, so
  scrolling never triggers a React render.

## Deploy

Push to GitHub → import into Vercel → no config needed. Then set `metadataBase`
to the real domain.
