'use client';

import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  Line,
  AdaptiveDpr,
  PerformanceMonitor,
  shaderMaterial,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
  SMAA,
  ToneMapping,
  HueSaturation,
  N8AO,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';

import {
  globeVertex,
  globeFragment,
  fieldVertex,
  fieldFragment,
  gridVertex,
  gridFragment,
  scanVertex,
  scanFragment,
} from './shaders';
import { useSceneStore } from './sceneStore';

import { ACID, CYAN, AMBER, RED, VIOLET, HEX, applyPalette } from './palette';

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
    uPointer: new THREE.Vector3(0, 0, 1),
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
  {
    uTime: 0,
    uOpacity: 1,
    uAlert: 0,
    uWeb: 0,
    uColor: ACID.clone(),
    uSweepColor: CYAN.clone(),
  },
  gridVertex,
  gridFragment
);

const ScanMaterial = shaderMaterial(
  { uTime: 0, uOpacity: 1, uColor: CYAN.clone() },
  scanVertex,
  scanFragment
);

extend({ HoloMaterial, FieldMaterial, GridMaterial, ScanMaterial });

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
  const { pointer, camera } = useThree();
  const aim = useMemo(() => new THREE.Vector3(), []);
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

      // where the pointer is aiming, in the globe's own space — drives the
      // ripple, so the hologram reacts to the cursor without a raycast
      aim.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      mat.current.uPointer.lerp(aim, 1 - Math.pow(0.005, delta));
    }
    if (inner.current) {
      inner.current.rotation.y += delta * 0.05;
      inner.current.material.opacity = 0.1 + glitch.current * 0.25;
    }
  });

  // shaderMaterial() freezes its uniform defaults into the class when this
  // module loads, which is before any theme is known. Hand the material its
  // colours explicitly instead. These are clones: the per-frame lerps below
  // write into whatever object they are given, and must not touch the shared
  // palette instances.
  const holoA = useMemo(() => ACID.clone(), []);
  const holoB = useMemo(() => CYAN.clone(), []);

  return (
    <group>
      <mesh geometry={geo}>
        <holoMaterial
          ref={mat}
          uColorA={holoA}
          uColorB={holoB}
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
        color={HEX.acid}
        lineWidth={1.3}
        dashed
        dashSize={0.2}
        gapSize={0.45}
        transparent
        opacity={0.45}
      />
      <mesh ref={packet}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={HEX.bone} toneMapped={false} />
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

  // shaderMaterial() freezes its uniform defaults into the class when this
  // module loads, which is before any theme is known. Hand the material its
  // colours explicitly instead. These are clones: the per-frame lerps below
  // write into whatever object they are given, and must not touch the shared
  // palette instances.
  const fieldA = useMemo(() => ACID.clone(), []);
  const fieldB = useMemo(() => CYAN.clone(), []);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <fieldMaterial
        ref={mat}
        uColorA={fieldA}
        uColorB={fieldB}
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
  useFrame(({ clock }, delta) => {
    if (!mat.current) return;
    const { progress, alert } = useSceneStore.getState();
    mat.current.uTime = clock.elapsedTime;
    mat.current.uOpacity = 0.5 + progress * 0.5;
    mat.current.uAlert = THREE.MathUtils.damp(mat.current.uAlert, alert ? 1 : 0, 4, delta);
    mat.current.uSweepColor.lerp(alert ? RED : CYAN, 1 - Math.pow(0.02, delta));
  });

  // shaderMaterial() freezes its uniform defaults into the class when this
  // module loads, which is before any theme is known. Hand the material its
  // colours explicitly instead. These are clones: the per-frame lerps below
  // write into whatever object they are given, and must not touch the shared
  // palette instances.
  const gridColor = useMemo(() => ACID.clone(), []);
  const sweepColor = useMemo(() => CYAN.clone(), []);
  // the floor rules itself as a web instead of a grid in the spider palette
  const web = useSceneStore((s) => (s.theme === 'spider' ? 1 : 0));

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, 0]}>
      <planeGeometry args={[70, 70, 1, 1]} />
      <gridMaterial
        ref={mat}
        uWeb={web}
        uColor={gridColor}
        uSweepColor={sweepColor}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── orb web + spider (spider palette only) ──────────────────── */

/**
 * An orb web with depth: the hub sits back and the rim comes forward, so the
 * strands read as a bowl the globe hangs inside rather than a decal on a
 * plane. Radial strands from the hub, capture rings that sag between them —
 * a ring drawn as a true circle reads as a dartboard, and the sag is the
 * whole difference.
 *
 * One LineSegments for the lot: a web is a few hundred short segments and
 * paying a draw call each would be silly.
 */
function OrbWeb({ strands = 16, rings = 7, radius = 6.4, dish = 0.34 }) {
  const group = useRef(null);

  const geometry = useMemo(() => {
    const pts = [];
    const TAU = Math.PI * 2;

    // anchors jittered off the regular angle; a perfectly even web looks
    // machined rather than spun
    const jitter = makeRandom(0x5eed_5b1d);
    const wobble = Array.from({ length: strands }, () => 0.82 + jitter() * 0.36);

    // hub back, rim forward — squared so the dish is shallow at the edge and
    // falls away quickly near the middle
    const zAt = (r) => -dish * radius * Math.pow(1 - Math.min(r / radius, 1), 2);

    const at = (i, r) => {
      const a = (i / strands) * TAU;
      return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, zAt(r));
    };

    // radial strands, hub outward, subdivided so they bend with the dish
    for (let i = 0; i < strands; i++) {
      const rMax = radius * wobble[i];
      const steps = 6;
      for (let k = 0; k < steps; k++) {
        pts.push(at(i, (k / steps) * rMax), at(i, ((k + 1) / steps) * rMax));
      }
    }

    // capture spiral: each segment sags toward the hub at its midpoint
    for (let k = 1; k <= rings; k++) {
      const f = Math.pow(k / rings, 1.25); // rings crowd toward the rim
      for (let i = 0; i < strands; i++) {
        const j = (i + 1) % strands;
        const a = at(i, radius * wobble[i] * f);
        const b = at(j, radius * wobble[j] * f);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        mid.x *= 0.93;
        mid.y *= 0.93;
        mid.z = zAt(Math.hypot(mid.x, mid.y));
        pts.push(a, mid, mid, b);
      }
    }

    // bridge lines anchoring the rim back into the dark, which is what sells
    // the web as something strung in space rather than drawn on glass
    for (let i = 0; i < strands; i += 3) {
      const rim = at(i, radius * wobble[i]);
      pts.push(rim, new THREE.Vector3(rim.x * 1.5, rim.y * 1.5, rim.z - radius * 0.5));
    }

    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [strands, rings, radius, dish]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    // barely moving: a web is anchored, it only breathes
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.06) * 0.04;
  });

  return (
    <group ref={group} position={[0, 0, -4.6]}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          color={ACID}
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/**
 * A spider, built from primitives rather than a downloaded model.
 *
 * The silhouette is the whole job. Legs that stick straight out read as a
 * tick. A real one goes outward and *up* to a knee standing above the body,
 * then folds down and out to the foot, so each leg here is three jointed
 * segments rather than a pair of spokes.
 *
 * Solid shaded rather than wireframe, so the scene fill lights model the body
 * and it turns with the light instead of reading as a flat decal.
 */
function Spider({ scale = 0.44, eyes = true }) {
  const group = useRef(null);
  const legs = useRef([]);
  const drop = useRef(0);

  // one geometry per segment kind, shared by all eight legs
  const geo = useMemo(
    () => ({
      femur: new THREE.CapsuleGeometry(0.052, 0.8, 3, 6),
      tibia: new THREE.CapsuleGeometry(0.038, 0.92, 3, 6),
      tarsus: new THREE.CapsuleGeometry(0.024, 0.46, 3, 5),
      eye: new THREE.SphereGeometry(0.045, 8, 6),
    }),
    []
  );

  const layout = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const side = i < 4 ? 1 : -1;
        const k = i % 4;
        return {
          side,
          k,
          yaw: side * (1.02 - k * 0.46), // fan front to back
          z: 0.3 - k * 0.2, // attachment point along the thorax
          phase: k * 0.85 + (side > 0 ? 0 : Math.PI),
        };
      }),
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const { alert } = useSceneStore.getState();

    // spider-sense: it drops on its line when the attack set-piece fires
    drop.current = THREE.MathUtils.damp(drop.current, alert ? 1 : 0, 2.2, delta);

    if (group.current) {
      group.current.position.y = 1.78 - drop.current * 3.4;
      group.current.position.x = 1.9 + Math.sin(t * 0.23) * 0.45;
      group.current.rotation.z = Math.sin(t * 0.4) * 0.09;
      // turn slowly so the shading reads as volume rather than a sticker
      group.current.rotation.y = Math.sin(t * 0.17) * 0.5;
    }

    // idle articulation: a hanging spider feels for the silk, so the legs
    // flex at the knee rather than sweeping like oars
    legs.current.forEach((leg, i) => {
      if (!leg) return;
      const l = layout[i];
      const flex = Math.sin(t * 1.5 + l.phase);
      leg.rotation.y = l.yaw + flex * 0.1;
      leg.rotation.z = flex * 0.07;
    });
  });

  return (
    <group ref={group} position={[1.9, 1.78, -1.2]} scale={scale}>
      {/* dragline back up out of frame */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0, 40, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={ACID} transparent opacity={0.3} depthWrite={false} />
      </line>

      {/* abdomen: the big rear lobe, longer than it is wide */}
      <mesh position={[0, -0.04, -0.62]} scale={[0.92, 0.82, 1.3]}>
        <sphereGeometry args={[0.5, 18, 14]} />
        <meshStandardMaterial
          color="#140609"
          emissive={ACID}
          emissiveIntensity={0.42}
          roughness={0.34}
          metalness={0.65}
        />
      </mesh>

      {/* cephalothorax: smaller and flatter, carries the legs and the eyes */}
      <mesh position={[0, 0, 0.28]} scale={[1, 0.74, 1.08]}>
        <sphereGeometry args={[0.34, 16, 12]} />
        <meshStandardMaterial
          color="#140609"
          emissive={ACID}
          emissiveIntensity={0.42}
          roughness={0.34}
          metalness={0.65}
        />
      </mesh>

      {/* eight eyes, two rows, front pair largest — the detail that stops the
          head reading as a bead */}
      {eyes &&
        [
          [0.09, 0.12, 0.55, 1.25],
          [-0.09, 0.12, 0.55, 1.25],
          [0.2, 0.08, 0.48, 0.85],
          [-0.2, 0.08, 0.48, 0.85],
          [0.13, 0.2, 0.46, 0.7],
          [-0.13, 0.2, 0.46, 0.7],
          [0.26, 0.16, 0.36, 0.6],
          [-0.26, 0.16, 0.36, 0.6],
        ].map(([x, y, z, sc], i) => (
          <mesh key={i} geometry={geo.eye} position={[x, y, z]} scale={sc}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        ))}

      {layout.map((l, i) => (
        <group
          key={i}
          ref={(el) => {
            legs.current[i] = el;
          }}
          position={[l.side * 0.18, 0.02, l.z]}
          rotation={[0, l.yaw, 0]}
        >
          {/* femur: out and up to a knee standing above the body */}
          <group rotation={[0, 0, l.side * 0.92]}>
            <mesh
              geometry={geo.femur}
              position={[l.side * 0.42, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial
                color="#140609"
                emissive={ACID}
                emissiveIntensity={0.38}
                roughness={0.36}
                metalness={0.6}
              />
            </mesh>

            {/* tibia: folds back down past the horizontal */}
            <group position={[l.side * 0.84, 0, 0]} rotation={[0, 0, -l.side * 1.78]}>
              <mesh
                geometry={geo.tibia}
                position={[l.side * 0.48, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshStandardMaterial
                  color="#140609"
                  emissive={ACID}
                  emissiveIntensity={0.38}
                  roughness={0.36}
                  metalness={0.6}
                />
              </mesh>

              {/* tarsus: the last short joint, angled to a point */}
              <group position={[l.side * 0.96, 0, 0]} rotation={[0, 0, -l.side * 0.42]}>
                <mesh
                  geometry={geo.tarsus}
                  position={[l.side * 0.24, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <meshStandardMaterial
                    color="#140609"
                    emissive={ACID}
                    emissiveIntensity={0.38}
                    roughness={0.36}
                    metalness={0.6}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      ))}
    </group>
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

/* ── instrument rings ────────────────────────────────────────── */

/** Gauge rings around the globe, with tick marks, counter-rotating. */
function InstrumentRing({ radius, tilt, speed, ticks = 48, color = HEX.cyan, opacity = 0.3 }) {
  const group = useRef(null);

  const { ring, marks } = useMemo(() => {
    const circle = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      circle.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }

    // tick marks as one line segment list — every fourth tick is longer
    const seg = [];
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2;
      const len = i % 4 === 0 ? 0.14 : 0.06;
      const inner = radius - len;
      seg.push(
        new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner),
        new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
      );
    }
    const g = new THREE.BufferGeometry().setFromPoints(seg);
    return { ring: circle, marks: g };
  }, [radius, ticks]);

  useEffect(() => () => marks.dispose(), [marks]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed;
  });

  return (
    <group ref={group} rotation={tilt}>
      <Line points={ring} color={color} lineWidth={1} transparent opacity={opacity} />
      <lineSegments geometry={marks}>
        <lineBasicMaterial color={color} transparent opacity={opacity * 1.6} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/* ── inner core ──────────────────────────────────────────────── */

/** A small pulsing body inside the shell, so the globe has an interior. */
function Core({ radius = 0.55 }) {
  const mesh = useRef(null);
  const halo = useRef(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const { alert } = useSceneStore.getState();

    if (mesh.current) {
      const beat = 1 + Math.sin(t * (alert ? 7 : 2.2)) * 0.12;
      mesh.current.scale.setScalar(beat);
      mesh.current.rotation.y += delta * 0.35;
      mesh.current.rotation.x += delta * 0.12;
      mesh.current.material.color.lerp(alert ? RED : ACID, 1 - Math.pow(0.02, delta));
    }
    if (halo.current) {
      halo.current.scale.setScalar(1.5 + Math.sin(t * 1.6) * 0.18);
      halo.current.material.opacity = 0.09 + Math.sin(t * 1.6) * 0.04;
      halo.current.material.color.lerp(alert ? AMBER : CYAN, 1 - Math.pow(0.02, delta));
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshBasicMaterial color={ACID} wireframe transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ── uplink beams ────────────────────────────────────────────── */

/** Beams running from the floor grid up to the globe, pulsing on a cycle. */
function Uplinks({ count = 4 }) {
  const refs = useRef([]);

  const beams = useMemo(() => {
    const rand = makeRandom(0x0b1e_a115);
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const dist = 3.4 + rand() * 3.2;
      return {
        key: i,
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        phase: rand() * 6,
        speed: 0.5 + rand() * 0.5,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const alert = useSceneStore.getState().alert;

    beams.forEach((b, i) => {
      const m = refs.current[i];
      if (!m) return;
      // a travelling pulse: bright as it climbs, dark between cycles
      const cycle = (t * b.speed + b.phase) % 3;
      const on = cycle < 1.4;
      m.visible = on;
      if (!on) return;
      const k = cycle / 1.4;
      m.material.opacity = Math.sin(k * Math.PI) * (alert ? 0.5 : 0.28);
      m.scale.y = 0.35 + k * 0.65;
      m.position.y = -3.4 + (m.scale.y * 3.4) / 2;
    });
  });

  return beams.map((b, i) => (
    <mesh
      key={b.key}
      ref={(el) => (refs.current[i] = el)}
      position={[b.x, -3.4, b.z]}
    >
      <cylinderGeometry args={[0.035, 0.12, 3.4, 8, 1, true]} />
      <meshBasicMaterial
        color={CYAN}
        transparent
        opacity={0.25}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  ));
}

/* ── orbiting probes ─────────────────────────────────────────── */

/** Small bodies on tilted orbits — the globe reads as a system, not a ball. */
function Probes({ count = 5 }) {
  const refs = useRef([]);

  const orbits = useMemo(() => {
    const rand = makeRandom(0x0b17_5a7e);
    return Array.from({ length: count }, (_, i) => ({
      radius: 2.5 + rand() * 1.8,
      speed: 0.18 + rand() * 0.3,
      phase: rand() * Math.PI * 2,
      tilt: [rand() * Math.PI, rand() * Math.PI, rand() * 0.6 - 0.3],
      size: 0.03 + rand() * 0.035,
      key: i,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    orbits.forEach((o, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = t * o.speed + o.phase;
      m.position.set(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
      m.scale.setScalar(o.size * (1 + Math.sin(t * 3 + o.phase) * 0.25));
    });
  });

  return orbits.map((o, i) => (
    <group key={o.key} rotation={o.tilt}>
      <mesh ref={(el) => (refs.current[i] = el)}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={HEX.bone}
          metalness={1}
          roughness={0.18}
          emissive={HEX.cyan}
          emissiveIntensity={0.35}
        />
      </mesh>
      <ProbeTrail radius={o.radius} speed={o.speed} phase={o.phase} />
    </group>
  ));
}

/**
 * The arc a probe has just travelled, fading out behind it.
 *
 * The geometry is allocated once and only its position attribute is rewritten
 * each frame — building a new BufferGeometry per frame would churn GPU buffers
 * for sixty allocations a second.
 */
function ProbeTrail({ radius, speed, phase, segments = 26, sweep = 0.9 }) {
  const lineRef = useRef(null);

  // Buffers are declared to R3F and then written through the object ref each
  // frame, never through the memo itself — a hook-owned value must not be
  // mutated, and a ref must not be read while rendering.
  const { positions, colors } = useMemo(() => {
    const n = segments + 1;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const k = 1 - i / segments; // tail fades toward the back
      col[i * 3] = 0.21 * k;
      col[i * 3 + 1] = 1.0 * k;
      col[i * 3 + 2] = 0.62 * k;
    }
    return { positions: new Float32Array(n * 3), colors: col };
  }, [segments]);

  useFrame(({ clock }) => {
    const geometry = lineRef.current?.geometry;
    if (!geometry) return;

    const head = clock.elapsedTime * speed + phase;
    const pos = geometry.attributes.position;

    for (let i = 0; i <= segments; i++) {
      const a = head - (i / segments) * sweep;
      pos.setXYZ(i, Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    pos.needsUpdate = true;
    geometry.computeBoundingSphere();
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </line>
  );
}

/* ── debris belt ─────────────────────────────────────────────── */

/** A slow belt of wireframe shards. Instanced with a standard material. */
function Debris({ count = 90 }) {
  const mesh = useRef(null);
  const group = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shards = useMemo(() => {
    const rand = makeRandom(0xdeb0_1235);
    return Array.from({ length: count }, () => ({
      radius: 3.2 + rand() * 3.4,
      angle: rand() * Math.PI * 2,
      y: (rand() - 0.5) * 1.4,
      scale: 0.02 + rand() * 0.05,
      spin: rand() * 0.6 + 0.1,
      drift: 0.02 + rand() * 0.05,
    }));
  }, [count]);

  useFrame(({ clock }, delta) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;

    shards.forEach((s, i) => {
      const a = s.angle + t * s.drift;
      dummy.position.set(Math.cos(a) * s.radius, s.y, Math.sin(a) * s.radius);
      dummy.rotation.set(t * s.spin, t * s.spin * 0.7, 0);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;

    if (group.current) group.current.rotation.y -= delta * 0.01;
  });

  return (
    <group ref={group} rotation={[0.24, 0, 0.1]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={CYAN}
          metalness={0.9}
          roughness={0.35}
          transparent
          opacity={0.42}
          emissive={CYAN}
          emissiveIntensity={0.15}
        />
      </instancedMesh>
    </group>
  );
}

/* ── scan plane ──────────────────────────────────────────────── */

/** A sheet that travels down through the globe like a CT slice. */
function ScanPlane({ radius = 2.6 }) {
  const mesh = useRef(null);
  const mat = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mesh.current) {
      // travel from above the globe to below it, then repeat
      const y = 2.2 - ((t * 0.35) % 1) * 4.4;
      mesh.current.position.y = y;
    }
    if (mat.current) {
      mat.current.uTime = t;
      mat.current.uOpacity = useSceneStore.getState().alert ? 0.35 : 1;
    }
  });

  // shaderMaterial() freezes its uniform defaults into the class when this
  // module loads, which is before any theme is known. Hand the material its
  // colours explicitly instead. These are clones: the per-frame lerps below
  // write into whatever object they are given, and must not touch the shared
  // palette instances.
  const scanColor = useMemo(() => CYAN.clone(), []);

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radius * 2, radius * 2, 1, 1]} />
      <scanMaterial
        ref={mat}
        uColor={scanColor}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

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
            color={HEX.red}
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

    // handheld micro-drift: a perfectly still camera is the clearest tell
    // that a scene is rendered rather than filmed. Folded into the set()
    // because target is hook-owned and must not be mutated in place.
    const st = performance.now() * 0.001;
    const driftX = Math.sin(st * 0.7) * 0.035 + Math.sin(st * 1.9) * 0.012;
    const driftY = Math.cos(st * 0.9) * 0.028 + Math.cos(st * 2.3) * 0.009;

    target.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], t) + pointer.x * 0.55 + driftX,
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], t) - pointer.y * 0.35 + driftY,
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

/**
 * A backgrounded tab should not keep the GPU spinning. Pausing the render
 * loop while the document is hidden saves battery and heat on laptops and
 * phones, and lets the main thread go idle so the page settles once it is
 * out of view. The loop resumes and repaints the instant the tab returns.
 */
function FrameGate() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setFrameloop('never');
      } else {
        setFrameloop('always');
        invalidate();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [setFrameloop, invalidate]);
  return null;
}

export default function Scene() {
  const [mode, setMode] = useState('full'); // full | lite | off
  const [dpr, setDpr] = useState(1.5);
  const [generation, setGeneration] = useState(0); // bumped to rebuild after context loss
  // occlusion + reflections are the two costly passes; they switch themselves
  // off if the frame rate sags rather than relying on a measurement I cannot
  // take reliably in every environment
  const [heavy, setHeavy] = useState(true);
  const [lost, setLost] = useState(false);

  const quality = useSceneStore((s) => s.quality);
  const theme = useSceneStore((s) => s.theme);
  const spider = theme === 'spider';

  // Retool the shared colour instances before the children below read them.
  // useMemo rather than an effect: an effect would run after the first frame
  // had already been drawn in the outgoing palette.
  useMemo(() => applyPalette(theme), [theme]);

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
        key={`${generation}-${theme}`}
        dpr={dpr}
        onCreated={onCreated}
        style={{ visibility: lost ? 'hidden' : 'visible' }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          // filmic response curve — highlights roll off instead of clipping,
          // which is most of what separates "rendered" from "canvas demo"
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ position: [0, 0, 6.6], fov: 46 }}
      >
        <color attach="background" args={['#04070a']} />
        <fog attach="fog" args={['#04070a', 9, 26]} />

        <PerformanceMonitor
          onDecline={() => {
            // shed the expensive passes before degrading resolution:
            // losing reflections reads better than losing sharpness
            setHeavy((was) => {
              if (was) return false;
              setDpr((d) => Math.max(0.85, d - 0.35));
              return false;
            });
          }}
          onIncline={() => setDpr((d) => Math.min(1.75, d + 0.2))}
        />
        <AdaptiveDpr pixelated={false} />
        <FrameGate />
        <ScrollBridge />

        <Suspense fallback={null}>
          {/* Studio rig built from emissive planes rather than a downloaded
              HDR: metal has something to reflect, no external asset is
              fetched, so the CSP stays closed and nothing blocks first paint.
              frames={1} bakes it once instead of every frame. */}
          <Environment resolution={128} frames={1}>
            <Lightformer intensity={2.4} color={HEX.acid} position={[0, 4, -6]} scale={[10, 4, 1]} />
            <Lightformer intensity={1.6} color={HEX.cyan} position={[-6, 1, 2]} scale={[6, 6, 1]} rotation-y={Math.PI / 2} />
            <Lightformer intensity={1.1} color={HEX.violet} position={[6, -2, 3]} scale={[6, 6, 1]} rotation-y={-Math.PI / 2} />
            <Lightformer intensity={0.7} color="#ffffff" position={[0, -5, 0]} scale={[12, 12, 1]} rotation-x={Math.PI / 2} />
          </Environment>

          <Rig>
            {/* the web and its occupant belong to the spider palette only */}
            {spider && <OrbWeb rings={lite ? 5 : 7} strands={lite ? 12 : 16} />}
            {spider && <Spider eyes={!lite} />}
            <HoloGlobe />
            <Nodes count={lite ? 42 : 90} />
            <Traffic count={lite ? 4 : 10} />
            <Shockwave count={lite ? 2 : 3} />
            <InstrumentRing radius={2.35} tilt={[Math.PI / 2.1, 0, 0.22]} speed={0.1} ticks={48} />
            <InstrumentRing radius={2.95} tilt={[Math.PI / 1.85, 0.5, -0.18]} speed={-0.07} ticks={32} color={HEX.acid} opacity={0.2} />
            <Core />
            <Probes count={lite ? 3 : 5} />
            <Uplinks count={lite ? 2 : 4} />
            <ScanPlane />
            {!lite && <Debris count={90} />}
            <Grid />
            {!lite && heavy && (
              /* mirror plate beneath the shader grid: the globe and probes
                 get a soft reflection, which is the single cue that reads as
                 an expensive render. Low res + blur keeps the extra pass cheap. */
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.45, 0]}>
                <planeGeometry args={[48, 48]} />
                <MeshReflectorMaterial
                  resolution={256}
                  mixBlur={1}
                  mixStrength={12}
                  blur={[420, 100]}
                  mirror={0.55}
                  depthScale={0.9}
                  minDepthThreshold={0.4}
                  maxDepthThreshold={1.2}
                  color="#04070a"
                  metalness={0.85}
                  roughness={0.9}
                />
              </mesh>
            )}
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
              {/* occlusion before bloom: creases and contact points darken,
                  which is what stops additive geometry floating in space */}
              {heavy && (
                <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={1} quality="performance" halfRes />
              )}
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
              {/* grade last: a touch of saturation, then filmic tone mapping,
                  then SMAA to clean the edges the disabled MSAA left behind */}
              <HueSaturation saturation={0.12} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <SMAA />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,7,10,0)_38%,rgba(4,7,10,0.88)_100%)]" />
    </div>
  );
}
