/**
 * FBX → GLB, without Blender.
 *
 * three's FBXLoader is plain JavaScript, so it parses a binary FBX in Node
 * given a couple of browser globals it expects. GLTFExporter then writes the
 * result back out. That avoids installing Blender just to change a container
 * format.
 *
 * Materials are replaced rather than carried over. Mixamo ships embedded
 * textures, exporting those from Node drags in canvas and ImageBitmap, and
 * the scene re-materialises everything to the active palette anyway — so the
 * textures would be thrown away on arrival. Dropping them here keeps the file
 * small and the export simple.
 *
 *   node scripts/fbx-to-glb.mjs <in.fbx> <out.glb>
 */
import fs from 'node:fs';
import path from 'node:path';
import { TextDecoder as NodeTextDecoder } from 'node:util';

// FBXLoader reaches for a few browser globals while parsing. It hands every
// embedded image to URL.createObjectURL; the textures are discarded below, so
// these only have to exist, not work.
globalThis.TextDecoder ??= NodeTextDecoder;
globalThis.self ??= globalThis;
globalThis.window ??= globalThis;
globalThis.URL.createObjectURL ??= () => 'blob:discarded';
globalThis.URL.revokeObjectURL ??= () => {};
globalThis.createImageBitmap ??= async () => ({ width: 1, height: 1, close() {} });

// TextureLoader builds an <img> through document. The load event never fires
// here, which is fine: the texture stays empty and the material carrying it is
// thrown away a few lines below.
globalThis.document ??= {
  createElementNS: () => ({
    addEventListener() {},
    removeEventListener() {},
    width: 1,
    height: 1,
    src: '',
  }),
  createElement: () => ({ getContext: () => null }),
};

// GLTFExporter reads its binary chunk back through a FileReader, which Node
// has no equivalent of. Blob already exposes the same bytes as a promise.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((b) => {
      this.result = b;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => {
      this.result = `data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node scripts/fbx-to-glb.mjs <in.fbx> <out.glb>');
  process.exit(1);
}

const THREE = await import('three');
const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

const buf = fs.readFileSync(inPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new FBXLoader();
const group = loader.parse(ab, path.dirname(inPath) + path.sep);

let meshes = 0;
let bones = 0;
group.traverse((o) => {
  if (o.isBone) bones += 1;
  if (!o.isMesh && !o.isSkinnedMesh) return;
  meshes += 1;
  // one plain material, no maps — the scene paints it at runtime
  o.material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.35,
  });
});

console.log('meshes   :', meshes);
console.log('bones    :', bones);
console.log('clips    :', group.animations.map((c) => `${c.name} (${c.duration.toFixed(2)}s)`));

const exporter = new GLTFExporter();
const glb = await new Promise((resolve, reject) =>
  exporter.parse(group, resolve, reject, { binary: true, animations: group.animations })
);

fs.writeFileSync(outPath, Buffer.from(glb));
console.log('wrote    :', outPath, (fs.statSync(outPath).size / 1024 / 1024).toFixed(2), 'MB');
