import * as THREE from "three";

/** Original lightweight meadow art; no external game assets. */
export function toonMaterials(root: THREE.Object3D) {
  const ramp = new THREE.DataTexture(
    new Uint8Array([75, 155, 235]),
    3,
    1,
    THREE.RedFormat,
  );
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const converted = new Map<THREE.Material, THREE.MeshToonMaterial>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const convert = (material: THREE.Material) => {
      if (converted.has(material)) return converted.get(material)!;
      const original = material as THREE.MeshStandardMaterial;
      const result = new THREE.MeshToonMaterial({
        color: original.color ?? new THREE.Color("white"),
        map: original.map ?? null,
        emissive: original.emissive ?? new THREE.Color("black"),
        emissiveIntensity: original.emissiveIntensity ?? 0,
        gradientMap: ramp,
        transparent: material.transparent,
        opacity: material.opacity,
        side: material.side,
      });
      result.name = material.name;
      converted.set(material, result);
      return result;
    };
    object.material = Array.isArray(object.material)
      ? object.material.map(convert)
      : convert(object.material);
  });
  converted.forEach((_, old) => old.dispose());
}

export function createPainterlyMeadow() {
  const world = new THREE.Group();
  world.name = "Nusaraya • wind meadow";
  let seed = 431;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const material = (color: string) =>
    new THREE.MeshLambertMaterial({ color, flatShading: true });
  const grass = material("#8da956"),
    hill = material("#668e70"),
    far = material("#759aa0");
  const stone = material("#9eac95"),
    bark = material("#667052");
  const leaf = material("#739449"),
    litLeaf = material("#a4b75a");
  const mesh = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = sx,
    sz = sx,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    world.add(m);
    return m;
  };
  const ground = new THREE.PlaneGeometry(160, 160, 38, 38);
  ground.rotateX(-Math.PI / 2);
  const pos = ground.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    const beyond = THREE.MathUtils.smoothstep(Math.hypot(x, z), 5, 18);
    pos.setY(
      i,
      -0.07 + beyond * (Math.sin(x * 0.19) * Math.cos(z * 0.14) * 1.4),
    );
  }
  const colors: number[] = [];
  const warmGrass = new THREE.Color("#c3c187"),
    coolGrass = new THREE.Color("#8da85e");
  const tint = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    const variation =
      0.5 + 0.25 * Math.sin(x * 0.35 + z * 0.12) + 0.2 * Math.cos(z * 0.42);
    tint
      .copy(coolGrass)
      .lerp(warmGrass, THREE.MathUtils.clamp(variation, 0, 1));
    colors.push(tint.r, tint.g, tint.b);
  }
  ground.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  grass.color.set("#ffffff");
  grass.vertexColors = true;
  ground.computeVertexNormals();
  mesh(ground, grass, 0, 0, 0).receiveShadow = true;
  hill.flatShading = false;
  far.flatShading = false;
  const rock = new THREE.IcosahedronGeometry(1, 2);
  for (let i = 0; i < 14; i++) {
    const x = (i - 6.5) * 7,
      z = -55 - rand() * 18;
    mesh(rock, far, x, 1, z, 8 + rand() * 5, 4 + rand() * 6, 7);
  }
  for (let i = 0; i < 9; i++)
    mesh(rock, hill, (i - 4) * 12, -2, -32 - rand() * 7, 8, 3 + rand() * 3, 7);
  // Open combat lane; frame it with small rocks and rounded trees.
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1,
      x = side * (4 + rand() * 13),
      z = -3 - rand() * 17;
    mesh(
      rock,
      stone,
      x,
      0.2,
      z,
      0.35 + rand() * 0.65,
      0.35 + rand() * 0.55,
      0.45 + rand() * 0.6,
    );
  }
  for (const [x, z, h] of [
    [-5, -7, 3.8],
    [6, -10, 4.6],
    [-10, -16, 5.2],
    [12, -19, 5],
    [-7, 1, 4.2],
    [8, 0, 4.5],
  ]) {
    mesh(new THREE.CylinderGeometry(0.12, 0.23, h, 7), bark, x, h / 2, z);
    mesh(rock, leaf, x, h - 0.1, z, 1.6, 1.25, 1.45);
    mesh(rock, litLeaf, x - 0.55, h + 0.55, z + 0.2, 1.25, 0.9, 1.1);
  }
  // One draw call for swaying grass blades, one for flowers.
  const bladeGeo = new THREE.BufferGeometry();
  bladeGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [-0.045, 0, 0, 0.045, 0, 0, 0.025, 0.45, 0],
      3,
    ),
  );
  bladeGeo.computeVertexNormals();
  const bladeMat = new THREE.MeshLambertMaterial({
    color: "#b1bd68",
    side: THREE.DoubleSide,
  });
  const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, 260);
  const helper = new THREE.Object3D();
  for (let i = 0; i < 260; i++) {
    let x = (rand() - 0.5) * 28,
      z = (rand() - 0.5) * 28;
    if (Math.abs(x) < 2.7 && z > -4 && z < 4) x += x < 0 ? -3 : 3;
    helper.position.set(x, -0.02, z);
    helper.rotation.y = rand() * Math.PI;
    helper.scale.setScalar(0.4 + rand());
    helper.updateMatrix();
    blades.setMatrixAt(i, helper.matrix);
  }
  world.add(blades);
  bladeMat.onBeforeCompile = (shader) => {
    shader.uniforms.meadowTime = { value: 0 };
    shader.vertexShader = "uniform float meadowTime;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\n transformed.x += sin(meadowTime + instanceMatrix[3].x * .7 + instanceMatrix[3].z) * position.y * .18;",
    );
    world.userData.windUniform = shader.uniforms.meadowTime;
  };
  const flower = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.055, 0),
    new THREE.MeshBasicMaterial({ color: "#fff0b7" }),
    55,
  );
  for (let i = 0; i < 55; i++) {
    helper.position.set(
      (i % 2 ? 1 : -1) * (3 + rand() * 7),
      0.12,
      -8 + rand() * 14,
    );
    helper.rotation.set(0, 0, 0);
    helper.scale.setScalar(0.7 + rand());
    helper.updateMatrix();
    flower.setMatrixAt(i, helper.matrix);
  }
  world.add(flower);
  // Clouds are distant simplified volumes; fog merges their edges with the sky.
  const cloud = new THREE.MeshBasicMaterial({ color: "#f1edda" });
  for (let i = 0; i < 7; i++)
    mesh(
      rock,
      cloud,
      (i - 3) * 14,
      15 + rand() * 4,
      -48 - rand() * 12,
      6,
      1.2,
      2,
    );
  return world;
}
