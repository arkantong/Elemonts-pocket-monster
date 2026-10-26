import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const BLENDER_MODELS: Readonly<Record<string, string>> = {
  pyroo: "/models/pyroo-v1.glb",
  croobit: "/models/croobit-v1.glb",
};
const cache = new Map<string, Promise<THREE.Group>>();

/** Each displayed instance owns its GPU resources; cached source assets stay reusable. */
export async function loadBlenderCreature(id: string): Promise<THREE.Group> {
  const url = BLENDER_MODELS[id];
  if (!url) throw new Error(`No Blender asset for ${id}`);
  let source = cache.get(url);
  if (!source) {
    source = new GLTFLoader().loadAsync(url).then((gltf) => gltf.scene);
    cache.set(url, source);
    source.catch(() => cache.delete(url));
  }
  const model = (await source).clone(true);
  const geometries = new Map<THREE.BufferGeometry, THREE.BufferGeometry>();
  const materials = new Map<THREE.Material, THREE.Material>();
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (!geometries.has(object.geometry))
      geometries.set(object.geometry, object.geometry.clone());
    object.geometry = geometries.get(object.geometry)!;
    const cloneMaterial = (original: THREE.Material) => {
      if (!materials.has(original)) materials.set(original, original.clone());
      return materials.get(original)!;
    };
    object.material = Array.isArray(object.material)
      ? object.material.map(cloneMaterial)
      : cloneMaterial(object.material);
    object.castShadow = true;
    object.receiveShadow = true;
  });
  // glTF export converts Blender -Y front / Z up to Three +Z front / Y up.
  const bounds = new THREE.Box3().setFromObject(model);
  const scale = 2.3 / Math.max(0.01, bounds.max.y - bounds.min.y);
  const center = bounds.getCenter(new THREE.Vector3());
  const root = new THREE.Group();
  root.name = `${id}-blender-v1`;
  model.scale.multiplyScalar(scale);
  model.position.set(
    -center.x * scale,
    -bounds.min.y * scale,
    -center.z * scale,
  );
  root.add(model);
  root.userData.blenderModel = id;
  return root;
}

export function disposeCreature(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    (Array.isArray(object.material)
      ? object.material
      : [object.material]
    ).forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  const ramps = new Set<THREE.Texture>();
  materials.forEach((material) => {
    if (material instanceof THREE.MeshToonMaterial && material.gradientMap)
      ramps.add(material.gradientMap);
    material.dispose();
  });
  ramps.forEach((texture) => texture.dispose());
}
