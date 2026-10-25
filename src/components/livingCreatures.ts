import * as THREE from "three";
import { APPEARANCE } from "../game/appearance";

const upgraded = new Set(["pyroo", "pyroar", "infernox", "mippo"]);
/** Art-directed models retain the supplied species palette and signature features. */
export function livingCreature(id: string): THREE.Group | undefined {
  if (!upgraded.has(id)) return;
  const a = APPEARANCE[id],
    hippo = id === "mippo";
  const stage = id === "infernox" ? 2 : id === "pyroar" ? 1 : 0;
  const root = new THREE.Group();
  root.name = id;
  const material = (color: string, roughness = 0.72, emissive = false) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      emissive: emissive ? color : "#000000",
      emissiveIntensity: emissive ? 0.4 : 0,
    });
  const main = material(a.palette[0]),
    accent = material(a.palette[1]),
    trim = material(a.palette[2]);
  const cream = material("#fff1db"),
    nose = material("#332139", 0.25),
    eye = material("#201829", 0.12),
    shine = material("#ffffff", 0.08),
    ember = material(a.palette[1], 0.45, true);
  const sphere = new THREE.SphereGeometry(1, 28, 20);
  function part(
    parent: THREE.Object3D,
    name: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    mat: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(sphere, mat);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function joint(
    parent: THREE.Object3D,
    name: string,
    x: number,
    y: number,
    z: number,
  ) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function tuft(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    length: number,
    width: number,
    mat: THREE.Material,
    lean = 0,
  ) {
    const geo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(width * 0.65, 0.08 * length),
        new THREE.Vector2(width, 0.3 * length),
        new THREE.Vector2(width * 0.7, 0.65 * length),
        new THREE.Vector2(0, length),
      ],
      16,
    );
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.z = lean;
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  const body = joint(root, "living-body", 0, 0, 0);
  part(
    body,
    "torso",
    0,
    hippo ? 0.76 : 0.78,
    -0.15,
    hippo ? 0.67 : 0.43,
    hippo ? 0.68 : 0.43,
    hippo ? 0.58 : 0.7,
    main,
  );
  part(
    body,
    "chest",
    0,
    hippo ? 0.66 : 0.76,
    0.35,
    hippo ? 0.47 : 0.36,
    hippo ? 0.44 : 0.43,
    0.23,
    hippo ? accent : cream,
  );
  for (const side of [-1, 1])
    for (const front of [-1, 1]) {
      const leg = joint(
        root,
        `living-leg-${side}-${front}`,
        side * (hippo ? 0.43 : 0.32),
        0.5,
        front * (hippo ? 0.32 : 0.48),
      );
      part(leg, "limb", 0, -0.15, 0, hippo ? 0.22 : 0.14, 0.3, 0.18, main);
      part(
        leg,
        "paw",
        0,
        -0.36,
        0.07,
        hippo ? 0.24 : 0.18,
        0.14,
        0.25,
        hippo ? accent : cream,
      );
      for (let toe = 0; toe < 3; toe++)
        part(
          leg,
          "toe",
          (toe - 1) * 0.09,
          -0.34,
          0.245,
          0.034,
          0.035,
          0.025,
          trim,
        );
    }
  const head = joint(
    body,
    "living-head",
    0,
    hippo ? 1.35 : 1.32,
    hippo ? 0.18 : 0.49,
  );
  part(
    head,
    "skull",
    0,
    0,
    0,
    hippo ? 0.61 : 0.49,
    hippo ? 0.52 : 0.43,
    hippo ? 0.48 : 0.4,
    main,
  );
  for (const side of [-1, 1]) {
    part(
      head,
      "cheek",
      side * 0.32,
      -0.17,
      0.19,
      hippo ? 0.27 : 0.22,
      0.22,
      0.24,
      hippo ? main : cream,
    );
    const ear = joint(
      head,
      `living-ear-${side}`,
      side * (hippo ? 0.43 : 0.34),
      hippo ? 0.4 : 0.28,
      -0.04,
    );
    if (hippo) {
      part(ear, "outer", 0, 0, 0, 0.17, 0.2, 0.13, main);
      part(ear, "inner", 0, 0, 0.105, 0.1, 0.13, 0.035, trim);
    } else {
      tuft(ear, 0, 0, 0, 0.65, 0.19, main, -side * 0.23);
      tuft(ear, 0, 0.06, 0.12, 0.44, 0.105, ember, -side * 0.23);
    }
    const blink = joint(
      head,
      `living-eye-${side}`,
      side * (hippo ? 0.255 : 0.23),
      0.045,
      hippo ? 0.405 : 0.345,
    );
    part(blink, "socket", 0, 0, -0.015, 0.118, 0.149, 0.06, trim);
    part(blink, "iris", 0, 0, 0.02, 0.092, 0.12, 0.055, eye);
    part(blink, "highlight", -0.025, 0.043, 0.066, 0.029, 0.036, 0.014, shine);
    part(
      blink,
      "highlight-small",
      0.027,
      -0.035,
      0.065,
      0.012,
      0.015,
      0.012,
      shine,
    );
    if (!hippo)
      for (let i = 0; i < 3; i++)
        tuft(
          head,
          side * (0.37 + i * 0.035),
          -0.21 + i * 0.06,
          0.05,
          0.25,
          0.105,
          main,
          -side * (0.9 + i * 0.14),
        );
  }
  if (hippo) {
    part(head, "muzzle", 0, -0.21, 0.37, 0.44, 0.24, 0.26, accent);
    for (const side of [-1, 1]) {
      part(
        head,
        "nostril",
        side * 0.23,
        -0.12,
        0.585,
        0.047,
        0.033,
        0.017,
        nose,
      );
      part(head, "blush", side * 0.41, -0.19, 0.43, 0.085, 0.05, 0.025, trim);
    }
  } else {
    part(head, "muzzle", 0, -0.18, 0.32, 0.25, 0.15, 0.23, cream);
    part(head, "nose", 0, -0.125, 0.535, 0.09, 0.06, 0.055, nose);
  }
  const mouth = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.12, -0.29, 0.54),
        new THREE.Vector3(0, -0.32, 0.57),
        new THREE.Vector3(0.12, -0.29, 0.54),
      ]),
      12,
      0.012,
      6,
      false,
    ),
    nose,
  );
  head.add(mouth);
  if (hippo) {
    const tail = joint(body, "living-tail-0", 0, 0.65, -0.65);
    part(tail, "tail", 0, 0, -0.14, 0.09, 0.1, 0.2, main);
  } else
    for (let i = 0; i < (stage === 2 ? 3 : 1); i++) {
      const tail = joint(body, `living-tail-${i}`, 0, 0.76, -0.64);
      tail.rotation.y = (i - (stage === 2 ? 1 : 0)) * 0.65;
      part(tail, "tail-base", 0, 0.12, -0.25, 0.19, 0.24, 0.4, main);
      const plume = part(
        tail,
        "tail-plume",
        0,
        0.42,
        -0.51,
        0.29,
        0.43,
        0.31,
        main,
      );
      plume.rotation.x = -0.45;
      const tip = part(
        tail,
        "tail-tip",
        0,
        0.68,
        -0.57,
        0.22,
        0.28,
        0.21,
        ember,
      );
      tip.rotation.x = -0.4;
      for (let j = 0; j < 3; j++)
        tuft(
          tail,
          (j - 1) * 0.12,
          0.73,
          -0.57,
          0.29,
          0.1,
          stage === 2 ? ember : trim,
          (j - 1) * -0.22,
        );
    }
  if (stage > 0)
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const m = tuft(
        body,
        Math.sin(angle) * 0.34,
        1.12 + Math.cos(angle) * 0.3,
        0.22,
        stage === 2 ? 0.53 : 0.4,
        0.15,
        i % 2 ? accent : ember,
        -angle,
      );
      m.rotation.x = -0.25;
    }
  if (stage > 0) {
    head.scale.setScalar(1 - stage * 0.07);
    head.position.y += stage * 0.06;
    const torso = body.getObjectByName("torso")!;
    torso.scale.z *= 1 + stage * 0.12;
    torso.scale.x *= 1 + stage * 0.08;
  }
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  root.scale.setScalar(2.3 / (bounds.max.y - bounds.min.y));
  root.position.y = -bounds.min.y * root.scale.y;
  root.userData.appearance = a;
  // Cache joint references, keeping per-frame updates independent of React renders.
  root.userData.living = {
    body,
    head,
    eyes: [
      head.getObjectByName("living-eye--1"),
      head.getObjectByName("living-eye-1"),
    ],
    tails: body.children.filter((o) => o.name.startsWith("living-tail")),
    ears: head.children.filter((o) => o.name.startsWith("living-ear")),
    phase: hippo ? 1.7 : 0,
  };
  return root;
}

export function animateLivingCreature(
  root: THREE.Group,
  time: number,
  reduced: boolean,
  fainted = false,
) {
  const rig = root.userData.living;
  if (!rig) return;
  const t = time * 0.001 + rig.phase,
    breath = reduced || fainted ? 0 : Math.sin(t * 2.1);
  rig.body.scale.y = 1 + breath * 0.014;
  rig.head.rotation.x = reduced || fainted ? 0 : Math.sin(t * 0.85) * 0.035;
  rig.head.rotation.y = reduced || fainted ? 0 : Math.sin(t * 0.65) * 0.06;
  const cycle = t % 4.9,
    blink = !reduced && cycle < 0.16 ? Math.sin((cycle / 0.16) * Math.PI) : 0;
  for (const eye of rig.eyes) eye.scale.y = fainted ? 0.12 : 1 - blink * 0.94;
  rig.tails.forEach((tail: THREE.Object3D, i: number) => {
    tail.rotation.z =
      reduced || fainted ? 0 : Math.sin(t * 1.6 + i * 0.6) * 0.13;
  });
  rig.ears.forEach((ear: THREE.Object3D, i: number) => {
    ear.rotation.x = reduced || fainted ? 0 : Math.sin(t * 1.8 + i) * 0.045;
  });
}
