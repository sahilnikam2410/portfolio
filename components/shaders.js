// ─────────────────────────────────────────────────────────────
//  GLSL used by the WebGL scene. Kept in one file so the shader
//  work is readable without hunting through components.
// ─────────────────────────────────────────────────────────────

/* ── shared noise (simplex 3D, Ashima) ─────────────────────── */
export const noise3D = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/* ── holographic globe ─────────────────────────────────────── */
// Fresnel rim + latitude scanlines + noise-driven surface pulse +
// a horizontal glitch band that sweeps down on a timer.

export const globeVertex = /* glsl */ `
${noise3D}

uniform float uTime;
uniform float uGlitch;
uniform float uMorph;
uniform vec3  uPointer;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying vec3 vPos;
varying float vNoise;
varying float vRipple;

void main() {
  vec3 pos = position;

  float n = snoise(normalize(position) * 2.4 + vec3(0.0, uTime * 0.15, 0.0));
  vNoise = n;

  // breathing displacement, stronger while a glitch is firing
  pos += normal * n * (0.045 + uGlitch * 0.12);

  // Ripple radiating from where the pointer aims at the sphere. Keep it a
  // tight cap: a wide falloff lights the whole front hemisphere and the
  // hologram collapses back into a solid blob.
  float aim = max(dot(normalize(position), normalize(uPointer)), 0.0);
  float cap = smoothstep(0.86, 1.0, aim);
  float ripple = cap * sin(aim * 40.0 - uTime * 5.0);
  pos += normal * ripple * 0.05;
  vRipple = cap;

  // horizontal tear: a thin band offsets sideways
  float band = smoothstep(0.02, 0.0, abs(fract(uTime * 0.35) * 2.6 - 1.3 - position.y * 0.5));
  pos.x += band * uGlitch * 0.35;

  // uMorph deflates the sphere toward a disc when the scene changes state
  pos.y = mix(pos.y, pos.y * 0.25, uMorph);

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  vPos = pos;

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const globeFragment = /* glsl */ `
uniform float uTime;
uniform float uGlitch;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uOpacity;

varying vec3 vNormalW;
varying vec3 vViewDir;
varying vec3 vPos;
varying float vNoise;
varying float vRipple;

void main() {
  // fresnel rim — the hologram edge
  float fres = pow(1.0 - clamp(dot(vNormalW, vViewDir), 0.0, 1.0), 2.6);

  // latitude scanlines, drifting upward
  float scan = smoothstep(0.42, 0.5, abs(fract(vPos.y * 9.0 - uTime * 0.45) - 0.5));

  // data pulse rings travelling along Y
  float pulse = smoothstep(0.985, 1.0, sin(vPos.y * 5.0 - uTime * 1.6) * 0.5 + 0.5);

  vec3 col = mix(uColorA, uColorB, clamp(fres * 1.4 + vNoise * 0.3, 0.0, 1.0));

  // The shell is additive and double-sided, so front and back faces stack.
  // Keep the body near-transparent and put the light in the rim, or the
  // globe reads as a glowing blob instead of a wireframe hologram.
  float alpha = fres * 0.5 + scan * 0.09 + pulse * 0.3 + vRipple * 0.18;
  alpha *= uOpacity;

  // glitch tints the whole shell toward cyan and lifts alpha
  col = mix(col, uColorB, uGlitch * 0.6);
  alpha += uGlitch * 0.12;

  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
}
`;

/* ── GPU particle field ────────────────────────────────────── */
// Every point carries a seed; the vertex shader curls it through a
// noise field so 30k particles cost one draw call and no CPU work.

export const fieldVertex = /* glsl */ `
${noise3D}

uniform float uTime;
uniform float uSize;
uniform float uScroll;
uniform vec2  uPointer;

attribute float aSeed;
attribute float aScale;

varying float vAlpha;
varying float vSeed;

void main() {
  vec3 pos = position;

  float t = uTime * 0.06 + aSeed * 6.283;

  // curl-ish drift
  pos.x += snoise(pos * 0.12 + vec3(t, 0.0, 0.0)) * 1.1;
  pos.y += snoise(pos * 0.12 + vec3(0.0, t, 0.0)) * 1.1;
  pos.z += snoise(pos * 0.12 + vec3(0.0, 0.0, t)) * 1.1;

  // parallax toward the pointer, depth-weighted
  float depth = smoothstep(-12.0, 8.0, pos.z);
  pos.xy += uPointer * depth * 1.3;

  // scroll pulls the field past the camera
  pos.z += uScroll * 9.0;
  pos.z = mod(pos.z + 14.0, 28.0) - 14.0;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aSeed * 40.0);
  vAlpha = twinkle * smoothstep(26.0, 4.0, -mv.z);
  vSeed = aSeed;

  gl_PointSize = uSize * aScale * (18.0 / -mv.z);
}
`;

export const fieldFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  // soft core with a hard centre so bloom has something to grab
  float core = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColorA, uColorB, step(0.82, vSeed));

  gl_FragColor = vec4(col, core * core * vAlpha * 0.9);
}
`;

/* ── scan plane ────────────────────────────────────────────── */
// A thin sheet that travels down through the globe, brightest at its own
// plane and fading out either side — a CT-slice read.

export const scanVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const scanFragment = /* glsl */ `
uniform float uTime;
uniform vec3  uColor;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  // concentric interference rings so the sheet is not a flat wash
  float d = length(vUv - 0.5) * 2.0;
  float rings = sin(d * 42.0 - uTime * 3.0) * 0.5 + 0.5;

  // fade to nothing at the rim
  float edge = smoothstep(1.0, 0.25, d);

  float a = (0.10 + rings * 0.16) * edge * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

/* ── ground grid ───────────────────────────────────────────── */
// Infinite-feeling scrolling grid with distance fade.

export const gridVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const gridFragment = /* glsl */ `
uniform float uTime;
uniform vec3  uColor;
uniform vec3  uSweepColor;
uniform float uOpacity;
uniform float uAlert;

varying vec2 vUv;
varying vec3 vPos;

float gridLine(vec2 uv, float scale, float width) {
  vec2 g = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
  float line = min(g.x, g.y);
  return 1.0 - smoothstep(0.0, width, line);
}

void main() {
  vec2 uv = vUv;
  uv.y += uTime * 0.02;

  float fine  = gridLine(uv, 60.0, 1.0) * 0.35;
  float major = gridLine(uv, 12.0, 1.2) * 0.8;

  vec2  c   = vUv - 0.5;
  float dist = length(c);

  // radial fade so the plane never shows an edge
  float fade = 1.0 - smoothstep(0.15, 0.5, dist);

  // ── radar sweep: a rotating arm, brightest at its leading edge, with a
  //    decaying tail behind it — the same read as a console radar display
  float ang    = atan(c.y, c.x);
  float sweep  = uTime * 0.55;
  float delta  = mod(sweep - ang, 6.28318);
  float arm    = exp(-delta * 2.6);            // tail falls off behind the arm
  float radar  = arm * smoothstep(0.5, 0.05, dist);

  // ── ping rings expanding out of the centre on the same period
  float ringT  = fract(uTime * 0.0875);
  float ring   = smoothstep(0.012, 0.0, abs(dist - ringT * 0.5)) * (1.0 - ringT);

  float grid = (fine + major) * fade;
  float a = (grid + radar * 0.5 + ring * 0.6) * uOpacity;
  if (a < 0.004) discard;

  // the sweep carries its own colour so an alert can turn the floor red
  vec3 col = mix(uColor, uSweepColor, clamp(radar + ring + uAlert * 0.5, 0.0, 1.0));
  gl_FragColor = vec4(col, a);
}
`;

