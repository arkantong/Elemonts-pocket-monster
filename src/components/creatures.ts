import * as THREE from "three";
import { APPEARANCE } from "../game/appearance";
export { APPEARANCE } from "../game/appearance";

/** Per-species visual concepts. These do not read or modify battle elements. */
export function creature(id: string) {
  const a = APPEARANCE[id];
  if (!a) throw new Error(`Unknown appearance: ${id}`);
  const g = new THREE.Group();
  g.name = id;
  const material = (color: string, glow = false) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: glow ? 0.4 : 0.72,
      emissive: glow ? color : "#000000",
      emissiveIntensity: glow ? 0.28 : 0,
    });
  const main = material(a.palette[0]),
    accent = material(a.palette[1]),
    trim = material(a.palette[2]);
  const light = material("#fff9ed"),
    ink = material("#30303b"),
    blush = material("#edacc0");
  const glow = material(a.palette[1], true);
  function mesh(
    geometry: THREE.BufferGeometry,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    mat: THREE.Material = main,
  ) {
    const o = new THREE.Mesh(geometry, mat);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    o.castShadow = true;
    g.add(o);
    return o;
  }
  const ball = (
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    m: THREE.Material = main,
  ) => mesh(new THREE.SphereGeometry(1, 24, 16), x, y, z, sx, sy, sz, m);
  const cone = (
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    m: THREE.Material = accent,
  ) => mesh(new THREE.ConeGeometry(r, h, 16), x, y, z, 1, 1, 1, m);
  function ribbon(
    points: number[][],
    radius: number,
    mat: THREE.Material = trim,
  ) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    return mesh(
      new THREE.TubeGeometry(curve, 24, radius, 8, false),
      0,
      0,
      0,
      1,
      1,
      1,
      mat,
    );
  }
  function ring(
    x: number,
    y: number,
    z: number,
    r: number,
    mat: THREE.Material = glow,
  ) {
    return mesh(
      new THREE.TorusGeometry(r, 0.045, 8, 40),
      x,
      y,
      z,
      1,
      1,
      1,
      mat,
    );
  }
  function ears(long = false, pointy = false) {
    for (const s of [-1, 1]) {
      if (pointy) {
        cone(s * 0.44, 1.98, 0, 0.25, 0.55);
        cone(s * 0.44, 2.01, 0.13, 0.12, 0.3, trim);
      } else {
        const e = ball(
          s * 0.46,
          long ? 2 : 1.9,
          0,
          long ? 0.17 : 0.22,
          long ? 0.5 : 0.22,
          0.14,
        );
        e.rotation.z = -s * 0.18;
        ball(
          s * 0.46,
          long ? 2.04 : 1.92,
          0.12,
          0.1,
          long ? 0.32 : 0.12,
          0.04,
          trim,
        );
      }
    }
  }
  function wings(petals = false) {
    for (const s of [-1, 1])
      for (let i = 0; i < (petals ? 3 : 1); i++) {
        const w = ball(
          s * (0.65 + i * 0.11),
          1.1 - i * 0.12,
          -0.05,
          0.24,
          0.48,
          0.11,
          i % 2 ? trim : accent,
        );
        w.rotation.z = -s * (0.6 + i * 0.18);
      }
  }
  function tail(count = 1, lantern = false) {
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * 0.4;
      ribbon(
        [
          [0.2, 0.4, -0.3],
          [x + 0.65, 0.6, -0.45],
          [x + 0.85, 1, -0.3],
        ],
        0.17,
        accent,
      );
      ball(x + 0.85, 1.03, -0.3, 0.2, 0.3, 0.19, lantern ? glow : trim);
    }
  }
  function mane(petals = 8) {
    for (let i = 0; i < petals; i++) {
      const t = (i / petals) * Math.PI * 2;
      const p = ball(
        Math.sin(t) * 0.62,
        1.43 + Math.cos(t) * 0.56,
        -0.12,
        0.24,
        0.35,
        0.13,
        i % 2 ? accent : trim,
      );
      p.rotation.z = -t;
    }
  }
  function horns() {
    for (const s of [-1, 1]) cone(s * 0.42, 2.02, -0.08, 0.15, 0.44, trim);
  }
  function fins() {
    for (const s of [-1, 1]) {
      const f = ball(s * 0.68, 0.9, 0, 0.4, 0.15, 0.12, accent);
      f.rotation.z = s * 0.3;
    }
  }
  const floating = [
    "jelly",
    "fish",
    "crystal",
    "lunar",
    "cotton",
    "ember",
    "droplet",
  ].includes(a.shape);
  const rounded = [
    "pebble",
    "shell",
    "plant",
    "droplet",
    "cotton",
    "ember",
  ].includes(a.shape);
  if (a.shape === "jelly") {
    /* The dome and tentacles are built below. */
  } else if (a.shape === "fish") ball(0, 1.35, 0, 0.63, 0.7, 0.4);
  else if (a.shape === "crystal")
    mesh(new THREE.OctahedronGeometry(0.7), 0, 1.3, 0, 1, 1.2, 0.75, main);
  else if (rounded) ball(0, 1, 0, 0.72, 0.77, 0.55);
  else {
    ball(0, 0.64, 0, 0.52, 0.6, 0.4);
    ball(0, 0.65, 0.32, 0.36, 0.4, 0.12, accent);
    ball(0, 1.44, 0, 0.64, 0.57, 0.5);
  }
  if (!floating)
    for (const s of [-1, 1]) ball(s * 0.32, 0.13, 0.15, 0.23, 0.15, 0.27, trim);
  if (!rounded && !floating)
    for (const s of [-1, 1]) {
      const arm = ball(s * 0.51, 0.76, 0, 0.17, 0.31, 0.18);
      arm.rotation.z = -s * 0.22;
    }
  // Faces share a friendly visual grammar, with expression based only on the art brief.
  const faceY = rounded ? 1.14 : 1.46,
    faceZ = rounded ? 0.52 : 0.49;
  for (const s of [-1, 1]) {
    ball(
      s * 0.23,
      faceY,
      faceZ,
      0.105,
      a.character === "Tenang" || a.character === "Santai" ? 0.115 : 0.15,
      0.055,
      ink,
    );
    ball(s * 0.25, faceY + 0.05, faceZ + 0.05, 0.028, 0.035, 0.018, light);
    ball(s * 0.39, faceY - 0.16, faceZ - 0.015, 0.11, 0.055, 0.025, blush);
  }
  ball(0, faceY - 0.22, faceZ + 0.015, 0.07, 0.035, 0.02, ink);
  switch (a.shape) {
    case "fox":
      ears(false, true);
      tail();
      ball(0, 1.23, 0.48, 0.27, 0.15, 0.12, trim);
      break;
    case "guardian":
      ears(false, true);
      mane(10);
      tail(3, true);
      break;
    case "croc":
      ball(0, 1.18, 0.52, 0.4, 0.22, 0.33, accent);
      for (const s of [-1, 1])
        cone(s * 0.22, 1.1, 0.78, 0.055, 0.13, light).rotation.z = Math.PI;
      for (let i = 0; i < 4; i++)
        cone(0, 0.6 + i * 0.3, -0.4, 0.12, 0.23, trim);
      tail();
      if (id === "rivaclaw")
        for (const s of [-1, 1])
          for (let i = 0; i < 3; i++)
            cone(s * 0.57, 0.53, 0.18 + i * 0.09, 0.05, 0.19, glow);
      break;
    case "dragon":
      horns();
      tail();
      if (id === "hydragon") {
        fins();
        for (const s of [-1, 1])
          ribbon(
            [
              [s * 0.2, 1.2, 0.65],
              [s * 0.55, 1.1, 0.7],
              [s * 0.7, 1.4, 0.4],
            ],
            0.035,
            trim,
          );
        for (const s of [-1, 1])
          ribbon(
            [
              [s * 0.5, 1.6, 0],
              [s * 0.9, 1.9, -0.2],
              [s * 0.65, 2.2, -0.2],
            ],
            0.09,
            accent,
          );
      } else {
        wings();
        for (const s of [-1, 1])
          for (let i = 0; i < 3; i++)
            ball(s * (0.53 + i * 0.12), 1.1, -0.1, 0.23, 0.2, 0.2, trim);
      }
      break;
    case "bird":
    case "phoenix":
      wings(true);
      cone(0, 1.3, 0.63, 0.13, 0.3, trim).rotation.x = Math.PI / 2;
      if (id === "voltavi")
        for (let i = 0; i < 3; i++)
          ball(
            (i - 1) * 0.16,
            1.99 + (0.1 - Math.abs(i - 1) * 0.08),
            0,
            0.1,
            0.24,
            0.1,
            accent,
          );
      else {
        for (let i = 0; i < 3; i++)
          ribbon(
            [
              [(i - 1) * 0.2, 0.5, -0.3],
              [(i - 1) * 0.4, 0.6, -0.55],
              [(i - 1) * 0.5, 1.1, -0.5],
            ],
            0.09,
            i % 2 ? trim : accent,
          );
      }
      if (a.shape === "phoenix") ring(0, 2.15, -0.15, 0.28);
      break;
    case "tusked":
      ears();
      for (const s of [-1, 1]) {
        cone(s * 0.28, 1.07, 0.55, 0.1, 0.35, accent);
        ribbon(
          [
            [s * 0.28, 1.07, 0.55],
            [s * 0.4, 1.22, 0.65],
            [s * 0.31, 1.35, 0.66],
          ],
          0.045,
          trim,
        );
      }
      break;
    case "titan":
      horns();
      for (const s of [-1, 1]) {
        ball(s * 0.64, 0.96, -0.04, 0.28, 0.3, 0.25, glow);
        ball(s * 0.32, 0.15, 0.2, 0.24, 0.15, 0.3, glow);
      }
      break;
    case "pebble":
      ribbon(
        [
          [-0.28, 0.95, 0.53],
          [-0.13, 0.88, 0.59],
          [0, 0.97, 0.59],
          [0.15, 0.89, 0.57],
          [0.28, 0.97, 0.53],
        ],
        0.025,
        accent,
      );
      ball(0.33, 1.65, -0.1, 0.2, 0.09, 0.15, trim);
      break;
    case "rhino":
    case "golem":
      ears();
      ball(0, 1.2, 0.5, 0.36, 0.21, 0.25, accent);
      cone(0, 1.45, 0.65, 0.13, 0.44, trim);
      if (a.shape === "golem")
        for (let i = 0; i < 5; i++)
          ball(
            (i - 2) * 0.17,
            1.0 + Math.sin(i) * 0.12,
            -0.4,
            0.24,
            0.25,
            0.22,
            trim,
          );
      else
        for (let i = 0; i < 3; i++)
          ball((i - 1) * 0.2, 1.05, -0.4, 0.15, 0.1, 0.15, trim);
      break;
    case "hippo":
      ears();
      ball(0, 1.2, 0.52, 0.44, 0.24, 0.24, accent);
      for (const s of [-1, 1])
        ball(s * 0.17, 1.27, 0.74, 0.045, 0.025, 0.025, ink);
      ball(0, 0.66, 0.4, 0.3, 0.3, 0.08, blush);
      break;
    case "cotton":
    case "ember":
      for (let i = 0; i < 10; i++) {
        const t = (i / 10) * Math.PI * 2;
        ball(
          Math.sin(t) * 0.56,
          1 + Math.cos(t) * 0.5,
          -0.06,
          0.26,
          0.27,
          0.28,
          i % 2 ? main : accent,
        );
      }
      if (a.shape === "cotton") ears(true);
      else
        for (let i = 0; i < 5; i++)
          ball(
            (i - 2) * 0.2,
            1.55 + Math.sin(i) * 0.14,
            0,
            0.13,
            0.22,
            0.13,
            glow,
          );
      break;
    case "boar":
      ears(false, true);
      ball(0, 1.2, 0.55, 0.31, 0.19, 0.19, trim);
      for (const s of [-1, 1]) {
        ball(s * 0.1, 1.21, 0.73, 0.035, 0.035, 0.02, ink);
        if (id === "magboar") cone(s * 0.34, 1.2, 0.55, 0.08, 0.3, glow);
      }
      ribbon(
        [
          [0.4, 0.4, -0.3],
          [0.73, 0.5, -0.35],
          [0.8, 0.74, -0.25],
          [0.66, 0.8, -0.2],
          [0.63, 0.65, -0.17],
        ],
        0.06,
        glow,
      );
      if (id === "magboar")
        for (const s of [-1, 1])
          ribbon(
            [
              [s * 0.35, 0.95, 0.25],
              [s * 0.2, 0.75, 0.38],
              [s * 0.3, 0.5, 0.33],
            ],
            0.035,
            glow,
          );
      break;
    case "seal":
      ears();
      fins();
      ball(0, 0.3, -0.3, 0.45, 0.19, 0.4, trim);
      break;
    case "lunar":
      fins();
      ring(0, 1.8, 0.38, 0.12, trim);
      ribbon(
        [
          [0.4, 0.6, 0],
          [0.9, 0.8, 0],
          [1, 1.3, 0],
          [0.75, 1.6, 0],
        ],
        0.1,
        trim,
      );
      break;
    case "jelly":
      main.transparent = true;
      main.opacity = 0.63;
      ball(0, 1.45, -0.03, 0.75, 0.55, 0.55);
      ball(0, 1.33, 0, 0.22, 0.22, 0.22, glow);
      for (let i = 0; i < 5; i++)
        ribbon(
          [
            [(i - 2) * 0.18, 1, 0],
            [(i - 2) * 0.22, 0.65, 0.1],
            [(i - 2) * 0.19, 0.3, 0],
          ],
          0.065,
          i % 2 ? accent : trim,
        );
      break;
    case "fish":
      fins();
      for (const s of [-1, 1]) {
        const f = ball(s * 0.65, 1.5, -0.1, 0.2, 0.58, 0.07, glow);
        f.rotation.z = s * 0.65;
      }
      ribbon(
        [
          [0, 0.45, -0.2],
          [0.3, 0.3, -0.4],
          [0.6, 0.65, -0.35],
        ],
        0.12,
        trim,
      );
      break;
    case "squirrel":
      ears(false, true);
      ribbon(
        [
          [0.3, 0.4, -0.2],
          [0.9, 0.75, -0.3],
          [0.6, 1.1, -0.35],
          [1, 1.45, -0.4],
          [0.75, 1.8, -0.4],
        ],
        0.19,
        accent,
      );
      break;
    case "lynx":
      ears(false, true);
      mane();
      for (const s of [-1, 1]) cone(s * 0.45, 2.2, 0, 0.07, 0.22, glow);
      tail();
      break;
    case "bee":
      for (const sign of [-1, 1]) {
        const wing = ball(sign * 0.7, 1, -0.15, 0.32, 0.45, 0.08, light);
        (wing.material as THREE.MeshStandardMaterial).transparent = true;
        (wing.material as THREE.MeshStandardMaterial).opacity = 0.75;
      }
      for (const s of [-1, 1]) {
        ribbon(
          [
            [s * 0.25, 1.8, 0],
            [s * 0.3, 2, 0],
            [s * 0.4, 2.15, 0],
          ],
          0.035,
          trim,
        );
        ball(s * 0.4, 2.15, 0, 0.08, 0.08, 0.08, glow);
      }
      for (let i = 0; i < 3; i++)
        ball(0, 0.45 + i * 0.15, 0.35, 0.37, 0.05, 0.08, accent);
      break;
    case "lizard":
      tail();
      for (let i = 0; i < 5; i++)
        ball(0, 0.55 + i * 0.3, -0.42, 0.14, 0.13, 0.14, trim);
      break;
    case "shell":
      for (let i = 0; i < 26; i++) {
        const q = (i / 26) * Math.PI * 4,
          r = (0.4 * i) / 26;
        ball(
          0.5 + Math.sin(q) * r * 0.65,
          0.85 + Math.cos(q) * r,
          0.46,
          0.055,
          0.055,
          0.04,
          accent,
        );
      }
      break;
    case "droplet":
      cone(0, 1.75, 0, 0.37, 0.65);
      ball(0.25, 2.22, 0, 0.1, 0.16, 0.1, glow);
      break;
    case "burrow":
      ears();
      ball(0, 1.2, 0.53, 0.4, 0.24, 0.28, accent);
      horns();
      for (const s of [-1, 1])
        for (let i = 0; i < 3; i++)
          ball(s * 0.58, 0.48, 0.12 + i * 0.1, 0.06, 0.07, 0.09, trim);
      break;
    case "cat":
      ears(false, true);
      tail();
      for (const s of [-1, 1])
        ball(s * 0.32, 0.14, 0.25, 0.16, 0.08, 0.16, glow);
      break;
    case "runner":
      ears(false, true);
      ribbon(
        [
          [0.3, 0.4, -0.3],
          [1, 0.5, -0.25],
          [0.9, 1.2, -0.3],
          [0.5, 1.5, -0.25],
        ],
        0.09,
        accent,
      );
      break;
    case "plant":
      ribbon(
        [
          [0, 1.6, 0],
          [0.04, 1.9, 0],
        ],
        0.045,
        accent,
      );
      for (const s of [-1, 1]) {
        const l = ball(s * 0.17, 1.91, 0, 0.22, 0.09, 0.12, accent);
        l.rotation.z = s * 0.4;
      }
      break;
    case "rabbit":
      ears(true);
      ball(0.43, 0.43, -0.3, 0.2, 0.2, 0.2, accent);
      break;
    case "crystal":
      mesh(new THREE.OctahedronGeometry(0.48), 0, 0.62, 0, 1, 1.2, 1, trim);
      for (let i = 0; i < 5; i++) {
        const t = (i / 5) * Math.PI * 2;
        cone(
          Math.sin(t) * 0.42,
          2.02,
          Math.cos(t) * 0.22,
          0.11,
          0.4,
          i % 2 ? accent : trim,
        );
      }
      ring(0, 2.32, -0.1, 0.42);
      break;
    case "night":
      ears(false, true);
      tail();
      ring(0.85, 1.13, -0.23, 0.16, trim);
      for (let i = 0; i < 8; i++)
        ball(
          Math.sin(i * 2.4) * 0.44,
          0.5 + (i % 4) * 0.36,
          0.38,
          0.035,
          0.035,
          0.02,
          light,
        );
      break;
  }
  if (id === "pyroar") mane(10);
  if (id === "pyroo")
    for (const s of [-1, 1]) ball(s * 0.44, 2.03, 0.08, 0.09, 0.13, 0.08, glow);
  // Normalize height/foot position for consistent camera framing across every form.
  g.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(g),
    height = bounds.max.y - bounds.min.y;
  g.scale.setScalar(2.3 / height);
  g.position.y = -bounds.min.y * g.scale.y;
  g.userData.appearance = a;
  return g;
}
