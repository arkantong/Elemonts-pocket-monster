import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { COLORS, SPECIES } from "../game/data";
import { Portrait } from "./ui";
function creature(id: string) {
  const s = SPECIES[id],
    g = new THREE.Group(),
    parts: THREE.Mesh[] = [];
  const palette = {
    main: new THREE.Color(COLORS[s.element]),
    belly: new THREE.Color("#ffe5b6"),
    dark: new THREE.Color("#493322"),
  };
  const mat = (color: THREE.Color | string, roughness = 0.7) =>
    new THREE.MeshStandardMaterial({ color, roughness });
  const main = mat(palette.main),
    belly = mat(palette.belly),
    dark = mat(palette.dark),
    white = mat("#fff9eb"),
    eye = mat("#211713", 0.16),
    pink = mat("#e69b8c");
  function ball(
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    m: THREE.Material = main,
  ) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    o.castShadow = true;
    g.add(o);
    parts.push(o);
    return o;
  }
  function cone(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    m: THREE.Material = belly,
    tilt = 0,
  ) {
    const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, 20), m);
    o.position.set(x, y, z);
    o.rotation.z = tilt;
    o.castShadow = true;
    g.add(o);
    return o;
  }
  const stage = s.stage;
  ball(0, 0.67, 0, 0.53, 0.67, 0.43);
  ball(0, 0.68, 0.35, 0.36, 0.43, 0.15, belly);
  const head = ball(0, 1.43, 0.02, 0.7, 0.61, 0.54);
  head.scale.multiplyScalar(1 + (stage - 1) * 0.04);
  for (const sign of [-1, 1]) {
    ball(sign * 0.34, 0.14, 0.16, 0.24, 0.16, 0.3);
    const arm = ball(sign * 0.51, 0.72, 0.04, 0.2, 0.34, 0.22);
    arm.rotation.z = sign * 0.24;
    ball(sign * 0.25, 1.48, 0.5, 0.19, 0.23, 0.09, white);
    ball(sign * 0.24, 1.47, 0.575, 0.125, 0.17, 0.045, eye);
    ball(sign * 0.27, 1.54, 0.612, 0.041, 0.052, 0.018, white);
    ball(sign * 0.43, 1.27, 0.46, 0.1, 0.06, 0.025, pink);
  }
  ball(0, 1.22, 0.49, 0.3, 0.18, 0.12, belly);
  ball(0, 1.28, 0.61, 0.09, 0.062, 0.045, dark);
  ball(0, 1.13, 0.6, 0.085, 0.045, 0.02, dark);
  if (["cub", "boar"].includes(s.shape)) {
    for (const sign of [-1, 1]) {
      ball(sign * 0.58, 1.83, 0, 0.29, 0.34, 0.12);
      ball(sign * 0.58, 1.83, 0.11, 0.17, 0.22, 0.03, belly);
    }
    ball(0.49, 0.53, -0.3, 0.18, 0.2, 0.6);
  }
  if (s.shape === "rabbit") {
    for (const sign of [-1, 1]) {
      const e = ball(sign * 0.39, 2.02, -0.08, 0.2, 0.57, 0.15);
      e.rotation.z = -sign * 0.28;
      const p = ball(sign * 0.39, 2.03, 0.055, 0.115, 0.4, 0.04, pink);
      p.rotation.z = -sign * 0.28;
    }
    ball(0.46, 0.5, -0.32, 0.24, 0.24, 0.24, belly);
  }
  if (s.shape === "elephant") {
    for (const sign of [-1, 1]) {
      ball(sign * 0.68, 1.5, -0.05, 0.38, 0.47, 0.13);
      ball(sign * 0.69, 1.52, 0.075, 0.25, 0.33, 0.03, belly);
      cone(sign * 0.33, 1.12, 0.53, 0.07, 0.25, belly, -sign * 0.5);
    }
    ball(0, 1.11, 0.67, 0.14, 0.34, 0.14);
    ball(0.08, 0.87, 0.7, 0.19, 0.12, 0.13);
  }
  if (s.shape === "rhino" || s.shape === "boar") {
    ball(0, 1.19, 0.58, 0.36, 0.24, 0.22);
    cone(0, 1.45, 0.69, 0.12, 0.45);
    for (const sign of [-1, 1]) ball(sign * 0.5, 1.94, -0.03, 0.18, 0.28, 0.13);
  }
  if (s.shape === "croc") {
    ball(0, 1.2, 0.58, 0.44, 0.25, 0.34);
    for (const sign of [-1, 1])
      ball(sign * 0.17, 1.36, 0.8, 0.045, 0.04, 0.025, dark);
    for (let i = 0; i < 4; i++)
      cone(0, 0.9 + i * 0.25, -0.43, 0.15, 0.28, mat("#207a91"));
    ball(0.48, 0.45, -0.35, 0.22, 0.2, 0.7);
  }
  if (s.shape === "bird") {
    for (const sign of [-1, 1]) {
      const w = ball(sign * 0.61, 0.84, 0, 0.19, 0.55, 0.35);
      w.rotation.z = sign * 0.5;
    }
    cone(0, 1.29, 0.65, 0.15, 0.31, belly, Math.PI / 2);
    for (let i = 0; i < 3; i++)
      cone((i - 1) * 0.16, 2.03, 0, 0.12, 0.45, main, (i - 1) * 0.3);
  }
  if (s.shape === "jelly") {
    ball(0, 1.42, 0, 0.81, 0.57, 0.59);
    for (const sign of [-1, 1]) {
      ball(sign * 0.24, 1.43, 0.56, 0.12, 0.17, 0.06, eye);
      ball(sign * 0.27, 1.49, 0.61, 0.03, 0.04, 0.02, white);
    }
    for (let i = 0; i < 5; i++) ball((i - 2) * 0.19, 0.47, 0, 0.1, 0.4, 0.11);
  }
  if (s.shape === "bug") {
    for (const sign of [-1, 1]) {
      ball(sign * 0.65, 0.95, -0.16, 0.4, 0.5, 0.1, belly);
      const antenna = ball(sign * 0.27, 2.02, 0, 0.035, 0.34, 0.035, dark);
      antenna.rotation.z = -sign * 0.3;
      ball(sign * 0.36, 2.29, 0, 0.11, 0.11, 0.11, main);
    }
  }
  if (s.element === "Api") {
    cone(0, 2.08, -0.01, 0.19, 0.62, mat("#ffd45f"), -0.18);
    cone(0.17, 2.01, 0, 0.12, 0.4, mat("#f9b534"), 0.25);
    if (s.shape === "cub")
      for (const sign of [-1, 1])
        cone(sign * 0.38, 1.98, 0, 0.1, 0.35, dark, -sign * 0.2);
  }
  if (s.element === "Listrik") cone(0, 2.1, 0, 0.14, 0.43, belly, 0.2);
  if (stage > 1) {
    g.scale.setScalar(1 + (stage - 1) * 0.15);
    for (const sign of [-1, 1])
      cone(
        sign * 0.5,
        1.87,
        -0.22,
        0.12,
        0.4 + stage * 0.12,
        dark,
        -sign * 0.4,
      );
  }
  if (s.element === "Holy")
    for (const sign of [-1, 1])
      ball(sign * 0.85, 1.25, -0.2, 0.45, 0.65, 0.12, white);
  return g;
}
export default function CreatureScene({
  species,
  enemy,
  react = 0,
  room = true,
}: {
  species: string;
  enemy?: string;
  react?: number;
  room?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    reaction = useRef(react),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    reaction.current = react;
  }, [react]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
    camera.position.set(0, 2.1, enemy ? 9.5 : 7);
    camera.lookAt(0, 1, 0);
    scene.add(new THREE.HemisphereLight("#ffefd5", "#52654d", 3));
    const key = new THREE.DirectionalLight("#fff0ce", 3.5);
    key.position.set(-3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#b8e7f5", 1.5);
    fill.position.set(4, 2, -2);
    scene.add(fill);
    const ours = creature(species);
    ours.position.x = enemy ? -1.65 : 0;
    ours.rotation.y = enemy ? 0.45 : -0.13;
    scene.add(ours);
    let theirs: THREE.Group | undefined;
    if (enemy) {
      theirs = creature(enemy);
      theirs.position.set(1.65, 0, -0.2);
      theirs.rotation.y = -0.45;
      scene.add(theirs);
    }
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15),
      new THREE.ShadowMaterial({ opacity: 0.2 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(1, h);
      camera.position.z = enemy ? (w / h < 1 ? 12 : 9.5) : 7;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0,
      last = 0,
      oldReaction = reaction.current,
      reactAt = -10000;
    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden || t - last < 32) return;
      last = t;
      if (oldReaction !== reaction.current) {
        reactAt = t;
        oldReaction = reaction.current;
      }
      const bounce = Math.max(0, 1 - (t - reactAt) / 700);
      ours.position.y = reduced
        ? 0
        : Math.sin(t * 0.002) * 0.035 + Math.sin(bounce * Math.PI) * 0.25;
      ours.rotation.y =
        (enemy ? 0.45 : -0.13) + (reduced ? 0 : Math.sin(t * 0.001) * 0.08);
      if (theirs && !reduced)
        theirs.position.y = Math.sin(t * 0.002 + 1) * 0.035;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [species, enemy]);
  return (
    <div
      className={`creature-canvas ${room ? "at-home" : ""}`}
      ref={host}
      role="img"
      aria-label={`${SPECIES[species].name}${enemy ? ` melawan ${SPECIES[enemy].name}` : ""}, karakter 3D`}
    >
      {failed && (
        <div className="fallback-creatures">
          <Portrait species={species} />
          {enemy && <Portrait species={enemy} />}
        </div>
      )}
    </div>
  );
}
