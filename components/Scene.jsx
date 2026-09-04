'use client';

import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  Line,
  AdaptiveDpr,
  PerformanceMonitor,
  shaderMaterial,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import {
  globeVertex,
  globeFragment,
  fieldVertex,
  fieldFragment,
  gridVertex,
  gridFragment,
} from './shaders';
import { useSceneStore } from './sceneStore';

const ACID = new THREE.Color('#35ff9e');
const CYAN = new THREE.Color('#35e0ff');
const AMBER = new THREE.Color('#ffd166');
const RED = new THREE.Color('#ff5f57');
const VIOLET = new THREE.Color('#9b8cff');

/**
 * What the globe is doing in each section. The background is not wallpaper —
 * it changes state as the reader moves, so scrolling feels like driving it.
 *   morph — 0 is a sphere, 1 collapses toward a disc
 *   spin  — group rotation speed
 */
const SECTION_STATE = {
  top: { morph: 0, a: ACID, b: CYAN, spin: 0.045 },
  about: { morph: 0.1, a: ACID, b: CYAN, spin: 0.05 },
  skills: { morph: 0.25, a: CYAN, b: ACID, spin: 0.09 },
  work: { morph: 0.15, a: ACID, b: VIOLET, spin: 0.06 },
  coverage: { morph: 0.72, a: AMBER, b: RED, spin: 0.16 }, // flattens into a map
  shell: { morph: 0.3, a: ACID, b: CYAN, spin: 0.03 },
  contact: { morph: 0, a: CYAN, b: ACID, spin: 0.02 },
};

/* ── materials ───────────────────────────────────────────────── */

const HoloMaterial = shaderMaterial(
  {
    uTime: 0,
    uGlitch: 0,
    uMorph: 0,
    uOpacity: 1,
    uColorA: ACID.clone(),
    uColorB: CYAN.clone(),
  },
  globeVertex,
  globeFragment
);

const FieldMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 9,
    uScroll: 0,
    uPointer: new THREE.Vector2(),
    uColorA: ACID.clone(),
    uColorB: CYAN.clone(),
  },
  fieldVertex,
  fieldFragment
);

const GridMaterial = shaderMaterial(
  { uTime: 0, uOpacity: 1, uColor: ACID.clone() },
  gridVertex,
  gridFragment
);

extend({ HoloMaterial, FieldMaterial, GridMaterial });

/* ── geometry helpers ────────────────────────────────────────── */

/**
 * Seeded PRNG. Geometry is built during render, so Math.random() there would
 * produce different results on a double-render under concurrent React.
 * mulberry32 keeps the scene identical every pass.
 */
function makeRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fibonacciSphere(count, radius) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius)
    );
  }
  return pts;
}

function arcPoints(a, b, radius, segments = 44) {
  const pts = [];
  const lift = 1 + a.distanceTo(b) / (radius * 3.4);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    const bow = 1 + (lift - 1) * Math.sin(Math.PI * t);
    p.normalize().multiplyScalar(radius * bow);
    pts.push(p);
  }
  return pts;
}

/* ── holographic globe ───────────────────────────────────────── */

function HoloGlobe({ radius = 1.75 }) {
  const mat = useRef(null);
  const inner = useRef(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(radius, 14), [radius]);
  const wire = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius * 1.02, 3)),
    [radius]
  );
  const glitch = useRef(0);
  const nextGlitch = useRef(2.5);

  useEffect(() => () => { geo.dispose(); wire.dispose(); }, [geo, wire]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const { section, alert, morph: manualMorph } = useSceneStore.getState();
    const state = SECTION_STATE[section] ?? SECTION_STATE.top;

    // fire a short glitch on an irregular timer, then decay it.
    // during an alert it fires constantly — the globe destabilises.
    const interval = alert ? 0.25 + Math.random() * 0.4 : 3 + Math.random() * 6;
    if (t > nextGlitch.current) {
      glitch.current = alert ? 1.4 : 1;
      nextGlitch.current = t + interval;
    }
    glitch.current = THREE.MathUtils.damp(glitch.current, 0, alert ? 3 : 6, delta);

    if (mat.current) {
      mat.current.uTime = t;
      mat.current.uGlitch = glitch.current;
      // konami sets morph manually; otherwise the section drives it
      mat.current.uMorph = THREE.MathUtils.damp(
        mat.current.uMorph,
        Math.max(state.morph, manualMorph),
        2.5,
        delta
      );
      mat.current.uColorA.lerp(alert ? RED : state.a, 1 - Math.pow(0.02, delta));
      mat.current.uColorB.lerp(alert ? AMBER : state.b, 1 - Math.pow(0.02, delta));
    }
    if (inner.current) {
      inner.current.rotation.y += delta * 0.05;
      inner.current.material.opacity = 0.1 + glitch.current * 0.25;
    }
  });

  return (
    <group>
      <mesh geometry={geo}>
        <holoMaterial
          ref={mat}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments ref={inner} geometry={wire}>
        <lineBasicMaterial color={CYAN} transparent opacity={0.32} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/* ── node network + hover ────────────────────────────────────── */

function Nodes({ radius = 1.79, count = 90 }) {
  const mesh = useRef(null);
  const [hovered, setHovered] = useState(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const nodes = useMemo(() => fibonacciSphere(count, radius), [count, radius]);
  const setLabel = useSceneStore((s) => s.setLabel);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;

    // a coverage row hovered in the DOM lights the node it maps to
    const rowHighlight = useSceneStore.getState().highlight;
    const linked = rowHighlight < 0 ? -1 : (rowHighlight * 13) % count;

    nodes.forEach((p, i) => {
      const isHot = i === hovered || i === linked;
      const pulse = 1 + Math.sin(t * 2 + i * 0.7) * 0.18;
      const s = (isHot ? 0.075 : 0.022) * pulse;
      dummy.position.copy(p).multiplyScalar(isHot ? 1.06 : 1);
      dummy.scale.setScalar(s);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, isHot ? CYAN : ACID);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && e.instanceId !== hovered) {
          setHovered(e.instanceId);
          setLabel(`node_${String(e.instanceId).padStart(3, '0')}`);
        }
      }}
      onPointerOut={() => {
        setHovered(-1);
        setLabel(null);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/* ── traffic arcs with travelling packets ────────────────────── */

function Arc({ points, delay, speed }) {
  const line = useRef(null);
  const packet = useRef(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame(({ clock }) => {
    const alert = useSceneStore.getState().alert;
    // during the alert every arc runs hot: faster, brighter, red
    const rate = alert ? speed * 3.4 : speed;
    const t = (clock.elapsedTime * rate + delay) % 3;

    if (line.current) {
      const m = line.current.material;
      m.dashOffset = -t * 1.5;
      const base = alert ? 0.95 : 0.5;
      m.opacity = t < 2 ? base * Math.min(1, t * 2.5) : base * (3 - t);
      m.color.lerp(alert ? RED : ACID, 0.08);
    }
    if (packet.current) {
      const p = Math.min(t / 2, 1);
      packet.current.position.copy(curve.getPointAt(p));
      packet.current.visible = t < 2;
      const s = 0.035 * (1 - Math.abs(p - 0.5) * 0.6);
      packet.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <Line
        ref={line}
        points={points}
        color="#35ff9e"
        lineWidth={1.3}
        dashed
        dashSize={0.2}
        gapSize={0.45}
        transparent
        opacity={0.45}
      />
      <mesh ref={packet}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#d6efe3" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Traffic({ radius = 1.79, count = 10 }) {
  const arcs = useMemo(() => {
    const rand = makeRandom(0x5eed_1a7c);
    const anchors = fibonacciSphere(26, radius);
    return Array.from({ length: count }, (_, i) => {
      const a = anchors[Math.floor(rand() * anchors.length)];
      const b = anchors[Math.floor(rand() * anchors.length)];
      const from = a;
      const to = a.equals(b) ? anchors[(anchors.indexOf(a) + 7) % anchors.length] : b;
      return {
        key: i,
        points: arcPoints(from, to, radius),
        delay: (i / count) * 3,
        speed: 0.4 + rand() * 0.35,
      };
    });
  }, [radius, count]);

  return arcs.map((a) => <Arc key={a.key} points={a.points} delay={a.delay} speed={a.speed} />);
}

/* ── GPU particle field ──────────────────────────────────────── */

function Field({ count = 26000 }) {
  const mat = useRef(null);
  const { pointer } = useThree();
  const smoothed = useRef(new THREE.Vector2());

  const geometry = useMemo(() => {
    const rand = makeRandom(0xc0ff_ee11);
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 34;
      pos[i * 3 + 1] = (rand() - 0.5) * 20;
      pos[i * 3 + 2] = (rand() - 0.5) * 28;
      seed[i] = rand();
      scale[i] = 0.4 + rand() * 1.5;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }, delta) => {
    if (!mat.current) return;
    smoothed.current.x = THREE.MathUtils.damp(smoothed.current.x, pointer.x, 2, delta);
    smoothed.current.y = THREE.MathUtils.damp(smoothed.current.y, pointer.y, 2, delta);
    mat.current.uTime = clock.elapsedTime;
    mat.current.uPointer.copy(smoothed.current);
    mat.current.uScroll = useSceneStore.getState().progress;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <fieldMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── ground grid ─────────────────────────────────────────────── */

function Grid() {
  const mat = useRef(null);
  useFrame(({ clock }) => {
    if (mat.current) {
      mat.current.uTime = clock.elapsedTime;
      mat.current.uOpacity = 0.5 + useSceneStore.getState().progress * 0.5;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, 0]}>
      <planeGeometry args={[70, 70, 1, 1]} />
      <gridMaterial ref={mat} transparent depthWrite={false} />
    </mesh>
  );
}

/* ── camera rig: scroll waypoints + pointer parallax ─────────── */

const WAYPOINTS = [
  { pos: [0, 0, 6.6], look: [0, 0, 0] },     // hero
  { pos: [2.6, 0.8, 5.2], look: [0, 0, 0] }, // about
  { pos: [-2.9, -0.6, 5.0], look: [0, 0.2, 0] }, // skills
  { pos: [0, 2.4, 4.6], look: [0, 0, 0] },   // work
  { pos: [3.1, -1.4, 5.6], look: [0, 0, 0] }, // coverage
  { pos: [0, 0.4, 8.2], look: [0, 0, 0] },   // contact
];

/* ── shockwave rings (alert set-piece) ───────────────────────── */

function Shockwave({ count = 3 }) {
  const group = useRef(null);
  const rings = useRef([]);
  const start = useRef(-1);

  useFrame(({ clock }) => {
    const alert = useSceneStore.getState().alert;
    if (!group.current) return;

    if (alert && start.current < 0) start.current = clock.elapsedTime;
    if (!alert) start.current = -1;

    group.current.visible = alert;
    if (!alert) return;

    const since = clock.elapsedTime - start.current;
    rings.current.forEach((m, i) => {
      if (!m) return;
      // each ring launches a beat after the previous one, then repeats
      const t = ((since - i * 0.45) % 1.8) / 1.8;
      const alive = since > i * 0.45;
      m.visible = alive;
      if (!alive) return;
      m.scale.setScalar(2.2 + t * 5.5);
      m.material.opacity = (1 - t) * 0.5;
    });
  });

  return (
    <group ref={group} visible={false} rotation={[Math.PI / 2, 0, 0]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)}>
          <ringGeometry args={[0.97, 1, 96]} />
          <meshBasicMaterial
            color="#ff5f57"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── camera + parallax rig ───────────────────────────────────── */

function Rig({ children }) {
  const group = useRef(null);
  const { pointer, camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const current = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((_, delta) => {
    const progress = useSceneStore.getState().progress;

    // interpolate between waypoints along scroll
    const span = WAYPOINTS.length - 1;
    const f = THREE.MathUtils.clamp(progress, 0, 1) * span;
    const i = Math.min(Math.floor(f), span - 1);
    const t = f - i;
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];

    target.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], t) + pointer.x * 0.55,
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], t) - pointer.y * 0.35,
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], t)
    );
    look.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], t),
      THREE.MathUtils.lerp(a.look[1], b.look[1], t),
      THREE.MathUtils.lerp(a.look[2], b.look[2], t)
    );

    camera.position.lerp(target, 1 - Math.pow(0.001, delta));
    current.lerp(look, 1 - Math.pow(0.001, delta));
    camera.lookAt(current);

    if (group.current) {
      const { section } = useSceneStore.getState();
      const spin = (SECTION_STATE[section] ?? SECTION_STATE.top).spin;
      group.current.rotation.y += delta * spin;
    }
  });

  return <group ref={group}>{children}</group>;
}

/* ── scroll reporter (writes into the shared store) ──────────── */

function ScrollBridge() {
  const setProgress = useSceneStore((s) => s.setProgress);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
      raf = requestAnimationFrame(read);
    };
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, [setProgress]);
  return null;
}

/* ── exported canvas ─────────────────────────────────────────── */

export default function Scene() {
  const [mode, setMode] = useState('full'); // full | lite | off
  const [dpr, setDpr] = useState(1.5);
  const [generation, setGeneration] = useState(0); // bumped to rebuild after context loss
  const [lost, setLost] = useState(false);

  const quality = useSceneStore((s) => s.quality);

  useEffect(() => {
    // an explicit user choice always wins over capability sniffing
    if (quality === 'off') {
      setMode('off');
      return;
    }
    if (quality === 'lite') {
      setMode('lite');
      setDpr(1.25);
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 768;
    const cores = navigator.hardwareConcurrency ?? 4;
    if (reduce) {
      setMode('off');
    } else if (small || cores <= 4) {
      setMode('lite');
      setDpr(1.25);
    } else {
      setMode('full');
      setDpr(1.5);
    }
  }, [quality]);

  /**
   * A GPU context can be lost on sleep/resume, driver reset, or when the
   * browser reclaims memory. Without this the canvas stays blank forever.
   */
  const onCreated = ({ gl }) => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault(); // required, or the context can never be restored
      setLost(true);
    });
    canvas.addEventListener('webglcontextrestored', () => {
      setLost(false);
      setGeneration((g) => g + 1);
    });
  };

  if (mode === 'off') {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-lines opacity-40" />
      </div>
    );
  }

  const lite = mode === 'lite';

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 grid-lines opacity-30" />
      <Canvas
        key={generation}
        dpr={dpr}
        onCreated={onCreated}
        style={{ visibility: lost ? 'hidden' : 'visible' }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        camera={{ position: [0, 0, 6.6], fov: 46 }}
      >
        <color attach="background" args={['#04070a']} />
        <fog attach="fog" args={['#04070a', 9, 26]} />

        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.85, d - 0.35))}
          onIncline={() => setDpr((d) => Math.min(1.75, d + 0.2))}
        />
        <AdaptiveDpr pixelated={false} />
        <ScrollBridge />

        <Suspense fallback={null}>
          <Rig>
            <HoloGlobe />
            <Nodes count={lite ? 42 : 90} />
            <Traffic count={lite ? 4 : 10} />
            <Shockwave count={lite ? 2 : 3} />
            <Grid />
          </Rig>
          <Field count={lite ? 4000 : 26000} />

          {/* phones and low-core machines get bloom only — the other three
              passes are full-screen reads they cannot spare */}
          {lite ? (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={0.7}
                luminanceThreshold={0.12}
                luminanceSmoothing={0.5}
                mipmapBlur
              />
              <Vignette offset={0.26} darkness={0.85} />
            </EffectComposer>
          ) : (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={0.75}
                luminanceThreshold={0.22}
                luminanceSmoothing={0.5}
                mipmapBlur
              />
              <ChromaticAberration
                offset={[0.0006, 0.0009]}
                blendFunction={BlendFunction.NORMAL}
              />
              <Scanline density={1.1} opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
              <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
              <Vignette offset={0.24} darkness={0.9} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,7,10,0)_38%,rgba(4,7,10,0.88)_100%)]" />
    </div>
  );
}
