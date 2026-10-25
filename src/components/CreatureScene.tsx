import { creature, APPEARANCE } from "./creatures";
import { t } from "../i18n";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SPECIES } from "../game/data";
import { Portrait } from "./ui";
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
    renderer.toneMappingExposure = 1.15;
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
    const baseY = ours.position.y;
    const calm = ["Tenang", "Santai", "Pemalu", "Bijak"].includes(
      APPEARANCE[species].character,
    );
    ours.position.x = enemy ? -1.65 : 0;
    ours.rotation.y = enemy ? 0.45 : -0.13;
    scene.add(ours);
    let theirs: THREE.Group | undefined;
    if (enemy) {
      theirs = creature(enemy);
      theirs.position.set(1.65, theirs.position.y, -0.2);
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
    const enemyY = theirs?.position.y ?? 0;
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
      ours.position.y =
        baseY +
        (reduced
          ? 0
          : Math.sin(t * (calm ? 0.001 : 0.002)) * 0.035 +
            Math.sin(bounce * Math.PI) * 0.25);
      ours.rotation.y =
        (enemy ? 0.45 : -0.13) + (reduced ? 0 : Math.sin(t * 0.001) * 0.08);
      if (theirs && !reduced)
        theirs.position.y = enemyY + Math.sin(t * 0.002 + 1) * 0.035;
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
      aria-label={t(
        `${SPECIES[species].name}${enemy ? ` melawan ${SPECIES[enemy].name}` : ""}, karakter 3D`,
      )}
    >
      {t(
        failed && (
          <div className="fallback-creatures">
            <Portrait species={species} />
            {t(enemy && <Portrait species={enemy} />)}
          </div>
        ),
      )}
    </div>
  );
}
