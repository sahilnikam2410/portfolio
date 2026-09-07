'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ACID, CYAN } from './palette';

const MODEL = '/models/hero.glb';

/**
 * The figure itself.
 *
 * Mixamo's clip runs 1.27s and ends on the landing. The switch lands at
 * 0.98s, so the clip is played slightly fast to put the foot-plant on the
 * beat rather than near it — the whole set-piece is built around the colour
 * turning over at the moment of impact, and a landing that misses by a fifth
 * of a second reads as two events instead of one.
 *
 * The clip clamps on its last frame rather than looping. It is a landing, not
 * a cycle; letting it run back to the top would have the figure fall twice.
 */
function Figure({ landAt = 0.98 }) {
  const group = useRef(null);
  const { scene, animations } = useGLTF(MODEL);
  const { mixer } = useAnimations(animations, group);
  const t = useRef(0);

  /**
   * Cloned through SkeletonUtils, not Object3D.clone.
   *
   * A plain clone copies the mesh and the bones but does not rebind one to
   * the other, so the copy renders collapsed to a point — a canvas with
   * nothing visible in it, which is exactly what the first version did.
   *
   * Mixamo also ships its own materials. The scene paints everything from the
   * palette, so the figure is re-materialised to match: dark body, emissive
   * edge, the same treatment the rest of the geometry gets.
   */
  const model = useMemo(() => {
    const root = cloneSkinned(scene);
    root.traverse((child) => {
      if (!child.isMesh && !child.isSkinnedMesh) return;
      // Emissive at 0.55 flattened it into a silhouette: a body that emits
      // its own colour everywhere has no shading left to describe its form.
      // Dropped low enough that the lights do the modelling, with the glow
      // only lifting the edges.
      child.material = new THREE.MeshStandardMaterial({
        color: '#1c0a0e',
        emissive: ACID.clone(),
        emissiveIntensity: 0.14,
        roughness: 0.34,
        metalness: 0.72,
        transparent: true,
        opacity: 0.94,
      });
      child.frustumCulled = false; // a skinned mesh can leave its bind box
    });
    return root;
  }, [scene]);

  useEffect(() => {
    const clip = animations[0];
    // captured, because the cleanup below must uncache the same root it
    // cached against, not whatever the ref points at by then
    const root = group.current;
    if (!clip || !mixer || !root) return;

    // The action is built here rather than taken from the hook's `actions`
    // map: it gets configured below, and a value handed back by a hook is not
    // ours to mutate.
    const action = mixer.clipAction(clip, root);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.timeScale = (clip.duration || 1.27) / landAt;
    action.play();

    return () => {
      action.stop();
      mixer.uncacheAction(clip, root);
    };
  }, [animations, mixer, landAt]);

  useFrame((_, delta) => {
    t.current += delta;
    if (!group.current) return;
    // fade out once it has landed and held for a moment
    const out = THREE.MathUtils.clamp((t.current - 1.35) / 0.5, 0, 1);
    group.current.traverse((o) => {
      if (o.material) {
        o.material.transparent = true;
        o.material.opacity = 1 - out;
      }
    });
  });

  /**
   * Mixamo exports in centimetres, so this rig measures 160 units head to
   * heel. At a scale of 1 the camera stands inside its shin — which is
   * exactly what happened, and why the first version rendered a canvas with
   * nothing visible in it.
   *
   * 0.0137 brings it to about 2.2 units, roughly the height of the globe, and
   * the y offset puts its feet on the point the burst fires from rather than
   * leaving it hovering.
   */
  // Off the centre line and smaller than a first pass had it: at 0.0137 it
  // stood across the name, and the hero copy is the point of the page.
  return <primitive ref={group} object={model} position={[1.35, -1.25, 0.4]} scale={0.0088} />;
}

/**
 * A transparent canvas that exists only while the palette is changing.
 *
 * Its own canvas rather than the scene's: the scene is mid-transition at this
 * exact moment — every colour in it travelling — and adding a skinned mesh to
 * that graph while it moves is the worst time to do it. Separate canvas,
 * separate lifetime, and it is gone before the next frame matters.
 */
export default function HeroDrop() {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.6, 4.6], fov: 42 }}
    >
      {/* key, fill, and a rim from behind — the rim is what separates the
          figure from a dark page without lighting it flat */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color={ACID} />
      <directionalLight position={[-5, 2, 2]} intensity={0.9} color={CYAN} />
      <directionalLight position={[0, 3, -6]} intensity={2.6} color={ACID} />
      <Figure />
    </Canvas>
  );
}

useGLTF.preload(MODEL);
